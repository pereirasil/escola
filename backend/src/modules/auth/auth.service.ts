import * as bcrypt from 'bcrypt'
import { createHash, randomBytes } from 'crypto'
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UsersService } from '../users/users.service'
import { StudentsService } from '../students/students.service'
import { TeachersService } from '../teachers/teachers.service'
import { ResponsiblesService } from '../responsibles/responsibles.service'
import { BoletoService } from '../payments/services/boleto.service'
import { RegisterDto } from './dto/register.dto'
import { RefreshToken, JwtSessionPayload } from './entities/refresh-token.entity'

const TAXA_CADASTRO = 159.99

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private usersService: UsersService,
    private studentsService: StudentsService,
    private teachersService: TeachersService,
    private responsiblesService: ResponsiblesService,
    private boletoService: BoletoService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshRepo: Repository<RefreshToken>,
  ) {}

  private getAccessExpiresIn(): string {
    return process.env.JWT_ACCESS_EXPIRES_IN?.trim() || '15m'
  }

  private getRefreshTtlMs(): number {
    const days = Number(process.env.JWT_REFRESH_DAYS || '7')
    if (!Number.isFinite(days) || days < 1) return 7 * 86400000
    return days * 86400000
  }

  private signAccessToken(payload: JwtSessionPayload): string {
    return this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email ?? undefined,
        role: payload.role,
        document: payload.document ?? undefined,
        school_id: payload.school_id ?? undefined,
        student_id: payload.student_id ?? undefined,
      },
      { expiresIn: this.getAccessExpiresIn() },
    )
  }

  private hashRefresh(raw: string): string {
    return createHash('sha256').update(raw, 'utf8').digest('hex')
  }

  private async persistRefreshToken(payload: JwtSessionPayload): Promise<string> {
    const raw = randomBytes(32).toString('hex')
    const row = this.refreshRepo.create({
      token_hash: this.hashRefresh(raw),
      expires_at: new Date(Date.now() + this.getRefreshTtlMs()),
      payload_json: payload,
      revoked_at: null,
    })
    await this.refreshRepo.save(row)
    return raw
  }

  private async issueTokens(payload: JwtSessionPayload) {
    const access_token = this.signAccessToken(payload)
    const refresh_token = await this.persistRefreshToken(payload)
    return { access_token, refresh_token }
  }

  async refreshSession(refreshTokenRaw: string) {
    const hash = this.hashRefresh(refreshTokenRaw)
    const row = await this.refreshRepo.findOne({ where: { token_hash: hash } })
    if (!row || row.revoked_at || row.expires_at.getTime() <= Date.now()) {
      throw new UnauthorizedException('Sessão inválida ou expirada')
    }
    row.revoked_at = new Date()
    await this.refreshRepo.save(row)
    return this.issueTokens(row.payload_json)
  }

  async revokeRefreshToken(refreshTokenRaw: string): Promise<void> {
    const hash = this.hashRefresh(refreshTokenRaw)
    const row = await this.refreshRepo.findOne({ where: { token_hash: hash } })
    if (!row || row.revoked_at) return
    row.revoked_at = new Date()
    await this.refreshRepo.save(row)
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('Credenciais inválidas')
    const valid = user.password_hash?.startsWith('$2')
      ? await bcrypt.compare(password, user.password_hash)
      : user.password_hash === password
    if (!valid) throw new UnauthorizedException('Credenciais inválidas')
    const isAdmin = user.role === 'admin'
    if (!isAdmin && user.approved !== 1) {
      throw new UnauthorizedException('Cadastro ainda não aprovado. Aguarde o administrador.')
    }
    const school_id = user.role === 'school' ? user.id : null
    const session: JwtSessionPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      school_id,
      student_id: null,
      document: null,
    }
    const tokens = await this.issueTokens(session)
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        school_id,
      },
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) {
      throw new ConflictException('E-mail já cadastrado')
    }
    const user = await this.usersService.createSchool({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      responsible_name: dto.responsible_name,
      cnpj: dto.cnpj,
      phone: dto.phone,
    })
    let pix: { qr_code: string; qr_code_text: string } | null = null
    try {
      const platformToken = this.boletoService.getPlatformToken()
      const result = await this.boletoService.generatePix(
        platformToken,
        user.id,
        TAXA_CADASTRO,
        dto.name,
        dto.email,
      )
      pix = { qr_code: result.qr_code, qr_code_text: result.qr_code_text }
    } catch (err) {
      this.logger.warn(`Erro ao gerar PIX de cadastro: ${err instanceof Error ? err.message : err}`)
    }
    return { user, pix }
  }

  async loginResponsible(cpf: string, password: string) {
    const responsible = await this.responsiblesService.findByCpf(cpf)
    if (!responsible) {
      throw new UnauthorizedException('CPF ou senha inválidos')
    }
    const valid = await this.responsiblesService.validatePassword(responsible, password)
    if (!valid) {
      throw new UnauthorizedException('CPF ou senha inválidos')
    }
    const students = await this.responsiblesService.getStudentsByResponsibleId(responsible.id)
    const firstStudent = students[0] ?? null
    const session: JwtSessionPayload = {
      sub: responsible.id,
      role: 'responsible',
      student_id: firstStudent?.id ?? null,
      school_id: firstStudent?.school_id ?? null,
      email: null,
      document: null,
    }
    const tokens = await this.issueTokens(session)
    return {
      ...tokens,
      responsible: { id: responsible.id, name: responsible.name, cpf: responsible.cpf },
      students,
    }
  }

  async responsibleUpdatePassword(responsibleId: number, currentPassword: string, newPassword: string) {
    await this.responsiblesService.updatePassword(responsibleId, currentPassword, newPassword)
  }

  async responsibleChooseStudent(responsibleId: number, studentId: number) {
    await this.responsiblesService.ensureAccessToStudent(responsibleId, studentId)
    const student = await this.studentsService.findOne(studentId)
    if (!student) {
      throw new UnauthorizedException('Aluno não encontrado')
    }
    const session: JwtSessionPayload = {
      sub: responsibleId,
      role: 'responsible',
      student_id: studentId,
      school_id: student.school_id ?? null,
      email: null,
      document: null,
    }
    const tokens = await this.issueTokens(session)
    return {
      ...tokens,
      student_id: studentId,
      school_id: student.school_id,
    }
  }

  async loginTeacher(cpf: string, password: string) {
    const teachers = await this.teachersService.findAllByDocument(cpf)
    const matched: typeof teachers = []
    for (const t of teachers) {
      if (t.password_hash && (await bcrypt.compare(password, t.password_hash))) {
        matched.push(t)
      }
    }
    if (matched.length === 0) {
      throw new UnauthorizedException('CPF ou senha inválidos')
    }
    if (matched.length === 1) {
      const m = matched[0]
      const session: JwtSessionPayload = {
        sub: m.id,
        role: 'teacher',
        document: m.document,
        school_id: m.school_id,
        email: m.email ?? null,
        student_id: null,
      }
      const tokens = await this.issueTokens(session)
      return {
        ...tokens,
        user: {
          id: m.id,
          name: m.name,
          role: 'teacher',
          document: m.document,
          school_id: m.school_id,
          photo: m.photo,
        },
      }
    }
    const schools = await this.teachersService.getSchoolsForTeachers(matched)
    const first = matched[0]
    const session: JwtSessionPayload = {
      sub: first.id,
      role: 'teacher',
      document: first.document,
      school_id: null,
      email: first.email ?? null,
      student_id: null,
    }
    const tokens = await this.issueTokens(session)
    return {
      requires_school_choice: true,
      schools,
      ...tokens,
      user: {
        id: first.id,
        name: first.name,
        role: 'teacher',
        document: first.document,
        school_id: null,
        photo: first.photo,
      },
    }
  }

  async teacherChooseSchool(document: string, schoolId: number) {
    const target = await this.teachersService.findByDocumentAndSchool(document, schoolId)
    if (!target) throw new UnauthorizedException('Escola inválida ou você não possui cadastro nela')
    const session: JwtSessionPayload = {
      sub: target.id,
      role: 'teacher',
      document: target.document,
      school_id: target.school_id,
      email: target.email ?? null,
      student_id: null,
    }
    const tokens = await this.issueTokens(session)
    return {
      ...tokens,
      user: {
        id: target.id,
        name: target.name,
        role: 'teacher',
        document: target.document,
        school_id: target.school_id,
        photo: target.photo,
      },
    }
  }

  async getAvatarByCpf(cpf: string) {
    const responsible = await this.responsiblesService.findByCpf(cpf)
    if (responsible) {
      return { photo: null, name: responsible.name }
    }
    const teachers = await this.teachersService.findAllByDocument(cpf)
    if (teachers.length > 0 && teachers[0].photo) {
      return { photo: teachers[0].photo, name: teachers[0].name }
    }
    if (teachers.length > 0) {
      return { photo: null, name: teachers[0].name }
    }
    return { photo: null, name: null }
  }
}
