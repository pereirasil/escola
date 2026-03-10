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
    const student = await this.studentsService.findByDocument(cpf)
    if (!student || !student.password_hash || !(await bcrypt.compare(password, student.password_hash))) {
      throw new UnauthorizedException('CPF ou senha inválidos')
    }
    const payload = { sub: student.id, role: 'student', document: student.document, school_id: student.school_id }
    const access_token = this.jwtService.sign(payload)
    return {
      access_token,
      user: { id: student.id, name: student.name, role: 'student', document: student.document, school_id: student.school_id },
    }
  }

  async loginTeacher(cpf: string, password: string) {
    const teacher = await this.teachersService.findByDocument(cpf)
    if (!teacher || !teacher.password_hash || !(await bcrypt.compare(password, teacher.password_hash))) {
      throw new UnauthorizedException('CPF ou senha inválidos')
    }
    const payload = { sub: teacher.id, role: 'teacher', document: teacher.document, school_id: teacher.school_id }
    const access_token = this.jwtService.sign(payload)
    return {
      access_token,
      user: { id: teacher.id, name: teacher.name, role: 'teacher', document: teacher.document, school_id: teacher.school_id },
    }
  }
}
