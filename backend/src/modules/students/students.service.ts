import * as bcrypt from 'bcrypt'
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Student } from './entities/student.entity'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'

const SALT_ROUNDS = 10

function normalizeCpf(cpf: string): string {
  return (cpf || '').replace(/\D/g, '')
}

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private repo: Repository<Student>,
  ) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } })
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } })
  }

  findByDocument(cpf: string): Promise<Student | null> {
    const normalized = normalizeCpf(cpf)
    return this.repo.findOne({ where: { document: normalized } })
  }

  async create(dto: CreateStudentDto) {
    const normalizedDoc = normalizeCpf(dto.document)
    const existing = await this.repo.findOne({ where: { document: normalizedDoc } })
    if (existing) {
      throw new ConflictException('CPF já cadastrado')
    }
    const hash = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const { password: _, ...rest } = dto
    return this.repo.save(this.repo.create({ ...rest, document: normalizedDoc, password_hash: hash }))
  }

  update(id: number, dto: UpdateStudentDto) {
    return this.repo.update(id, dto as Partial<Student>).then(() => this.findOne(id))
  }

  remove(id: number) {
    return this.repo.delete(id)
  }

  async updatePassword(studentId: number, currentPassword: string, newPassword: string) {
    const student = await this.findOne(studentId)
    if (!student || !student.password_hash) {
      throw new UnauthorizedException('Aluno não encontrado ou sem senha definida')
    }
    const valid = await bcrypt.compare(currentPassword, student.password_hash)
    if (!valid) {
      throw new UnauthorizedException('Senha atual incorreta')
    }
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await this.repo.update(studentId, { password_hash: hash })
    return this.findOne(studentId)
  }
}
