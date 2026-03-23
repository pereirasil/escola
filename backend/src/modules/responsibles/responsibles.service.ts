import * as bcrypt from 'bcrypt'
import { Injectable, ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Responsible } from './entities/responsible.entity'
import { ResponsibleStudent } from './entities/responsible-student.entity'
import { Student } from '../students/entities/student.entity'

const SALT_ROUNDS = 10

function normalizeCpf(cpf: string): string {
  return (cpf || '').replace(/\D/g, '')
}

@Injectable()
export class ResponsiblesService {
  constructor(
    @InjectRepository(Responsible)
    private repo: Repository<Responsible>,
    @InjectRepository(ResponsibleStudent)
    private junctionRepo: Repository<ResponsibleStudent>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {}

  async findByCpf(cpf: string): Promise<Responsible | null> {
    const normalized = normalizeCpf(cpf)
    return this.repo.findOne({ where: { cpf: normalized } })
  }

  async findOrCreate(name: string, cpf: string, password: string): Promise<Responsible> {
    const normalized = normalizeCpf(cpf)
    const existing = await this.findByCpf(normalized)
    if (existing) return existing
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    return this.repo.save(this.repo.create({ name, cpf: normalized, password_hash: hash }))
  }

  async create(name: string, cpf: string, password: string): Promise<Responsible> {
    const normalized = normalizeCpf(cpf)
    const existing = await this.findByCpf(normalized)
    if (existing) {
      throw new ConflictException('CPF já cadastrado')
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    return this.repo.save(this.repo.create({ name, cpf: normalized, password_hash: hash }))
  }

  async validatePassword(responsible: Responsible, password: string): Promise<boolean> {
    return bcrypt.compare(password, responsible.password_hash)
  }

  async getStudentsByResponsibleId(responsibleId: number): Promise<Student[]> {
    const links = await this.junctionRepo.find({
      where: { responsible_id: responsibleId },
      relations: ['student'],
    })
    const students = links.map((l) => l.student)
    students.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return students
  }

  async linkStudent(responsibleId: number, studentId: number): Promise<ResponsibleStudent> {
    const existing = await this.junctionRepo.findOne({
      where: { responsible_id: responsibleId, student_id: studentId },
    })
    if (existing) return existing
    return this.junctionRepo.save(
      this.junctionRepo.create({ responsible_id: responsibleId, student_id: studentId }),
    )
  }

  async hasAccessToStudent(responsibleId: number, studentId: number): Promise<boolean> {
    const link = await this.junctionRepo.findOne({
      where: { responsible_id: responsibleId, student_id: studentId },
    })
    return !!link
  }

  async ensureAccessToStudent(responsibleId: number, studentId: number): Promise<void> {
    const hasAccess = await this.hasAccessToStudent(responsibleId, studentId)
    if (!hasAccess) {
      throw new ForbiddenException('Você não tem acesso a este aluno')
    }
  }

  async updatePassword(responsibleId: number, currentPassword: string, newPassword: string): Promise<void> {
    const responsible = await this.repo.findOne({ where: { id: responsibleId } })
    if (!responsible) {
      throw new UnauthorizedException('Responsável não encontrado')
    }
    const valid = await this.validatePassword(responsible, currentPassword)
    if (!valid) {
      throw new UnauthorizedException('Senha atual incorreta')
    }
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await this.repo.update(responsibleId, { password_hash: hash })
  }
}
