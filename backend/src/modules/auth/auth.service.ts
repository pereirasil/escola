import * as bcrypt from 'bcrypt'
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { StudentsService } from '../students/students.service'
import { TeachersService } from '../teachers/teachers.service'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private studentsService: StudentsService,
    private teachersService: TeachersService,
    private jwtService: JwtService,
  ) {}

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
    const payload = { sub: user.id, email: user.email, role: user.role, school_id }
    return { access_token: this.jwtService.sign(payload), user: { id: user.id, email: user.email, name: user.name, role: user.role, school_id } }
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) {
      throw new ConflictException('E-mail já cadastrado')
    }
    return this.usersService.createSchool({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      responsible_name: dto.responsible_name,
      cnpj: dto.cnpj,
      phone: dto.phone,
    })
  }

  async loginStudent(cpf: string, password: string) {
    const students = await this.studentsService.findAllByDocument(cpf)
    let matched: typeof students[0] | null = null
    for (const s of students) {
      if (s.password_hash && (await bcrypt.compare(password, s.password_hash))) {
        matched = s
        break
      }
    }
    if (!matched) {
      throw new UnauthorizedException('CPF ou senha inválidos')
    }
    const payload = { sub: matched.id, role: 'student', document: matched.document, school_id: matched.school_id }
    const access_token = this.jwtService.sign(payload)
    return {
      access_token,
      user: { id: matched.id, name: matched.name, role: 'student', document: matched.document, school_id: matched.school_id },
    }
  }

  async loginTeacher(cpf: string, password: string) {
    const teachers = await this.teachersService.findAllByDocument(cpf)
    let matched: typeof teachers[0] | null = null
    for (const t of teachers) {
      if (t.password_hash && (await bcrypt.compare(password, t.password_hash))) {
        matched = t
        break
      }
    }
    if (!matched) {
      throw new UnauthorizedException('CPF ou senha inválidos')
    }
    const payload = { sub: matched.id, role: 'teacher', document: matched.document, school_id: matched.school_id }
    const access_token = this.jwtService.sign(payload)
    return {
      access_token,
      user: { id: matched.id, name: matched.name, role: 'teacher', document: matched.document, school_id: matched.school_id },
    }
  }
}
