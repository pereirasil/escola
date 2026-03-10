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

  findAll(schoolId?: number) {
    const where = schoolId ? { school_id: schoolId } : {}
    return this.repo.find({ where, order: { name: 'ASC' } })
  }

  async findAllPaginated(schoolId: number | undefined, page: number, limit: number) {
    const where = schoolId ? { school_id: schoolId } : {}
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return { data, page, limit, total, totalPages: Math.ceil(total / limit) }
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } })
  }

  findByDocument(cpf: string): Promise<Student | null> {
    const normalized = normalizeCpf(cpf)
    return this.repo.findOne({ where: { document: normalized } })
  }

  async create(dto: CreateStudentDto, schoolId?: number) {
    const normalizedDoc = normalizeCpf(dto.document)
    const where: any = { document: normalizedDoc }
    if (schoolId) where.school_id = schoolId
    const existing = await this.repo.findOne({ where })
    if (existing) {
      throw new ConflictException('CPF já cadastrado')
    }
    const hash = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const { password: _, ...rest } = dto
    return this.repo.save(this.repo.create({ ...rest, document: normalizedDoc, password_hash: hash, school_id: schoolId }))
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
