import * as bcrypt from 'bcrypt'
import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { Student } from './entities/student.entity'
import { User } from '../users/entities/user.entity'
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
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  findAll(schoolId?: number, isAdmin = false) {
    if (!isAdmin && schoolId == null) throw new ForbiddenException('Identificação da escola não encontrada')
    const where = schoolId != null ? { school_id: schoolId } : {}
    return this.repo.find({ where, order: { name: 'ASC' } })
  }

  search(schoolId: number | undefined, query = '', limit = 20, isAdmin = false) {
    if (!isAdmin && schoolId == null) throw new ForbiddenException('Identificação da escola não encontrada')
    const normalizedQuery = query.trim()
    const qb = this.repo.createQueryBuilder('student').orderBy('student.name', 'ASC').take(limit)

    if (schoolId != null) {
      qb.andWhere('student.school_id = :schoolId', { schoolId })
    }

    if (normalizedQuery) {
      const digits = normalizeCpf(normalizedQuery)
      qb.andWhere(
        new Brackets((sub) => {
          sub.where('LOWER(student.name) LIKE LOWER(:name)', { name: `%${normalizedQuery}%` })
          if (digits) {
            sub.orWhere('student.document LIKE :document', { document: `%${digits}%` })
          }
        }),
      )
    }

    return qb.getMany()
  }

  async findAllPaginated(schoolId: number | undefined, page: number, limit: number, isAdmin = false) {
    if (!isAdmin && schoolId == null) throw new ForbiddenException('Identificação da escola não encontrada')
    const where = schoolId != null ? { school_id: schoolId } : {}
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return { data, page, limit, total, totalPages: Math.ceil(total / limit) }
  }

  findOne(id: number, schoolId?: number) {
    const where: { id: number; school_id?: number } = { id }
    if (schoolId != null) where.school_id = schoolId
    return this.repo.findOne({ where })
  }

  async getHeaderInfo(studentId: number): Promise<{ guardian_name: string | null; school_name: string | null }> {
    const student = await this.findOne(studentId)
    if (!student) return { guardian_name: null, school_name: null }
    let school_name: string | null = null
    if (student.school_id) {
      const school = await this.userRepo.findOne({
        where: { id: student.school_id, role: 'school' },
        select: ['name'],
      })
      school_name = school?.name ?? null
    }
    return {
      guardian_name: student.guardian_name ?? null,
      school_name,
    }
  }

  findByDocument(cpf: string): Promise<Student | null> {
    const normalized = normalizeCpf(cpf)
    return this.repo.findOne({ where: { document: normalized } })
  }

  findAllByDocument(cpf: string): Promise<Student[]> {
    const normalized = normalizeCpf(cpf)
    return this.repo.find({ where: { document: normalized } })
  }

  findByDocumentAndSchool(cpf: string, schoolId: number): Promise<Student | null> {
    const normalized = normalizeCpf(cpf)
    return this.repo.findOne({ where: { document: normalized, school_id: schoolId } })
  }

  async create(dto: CreateStudentDto, schoolId?: number) {
    const normalizedDoc = normalizeCpf(dto.document)
    const existing =
      schoolId != null
        ? await this.findByDocumentAndSchool(normalizedDoc, schoolId)
        : await this.repo.findOne({ where: { document: normalizedDoc } })
    if (existing) {
      throw new ConflictException('CPF já cadastrado nesta escola')
    }
    const hash = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const { password: _, ...rest } = dto
    return this.repo.save(this.repo.create({ ...rest, document: normalizedDoc, password_hash: hash, school_id: schoolId }))
  }

  async update(id: number, dto: UpdateStudentDto, schoolId?: number) {
    const existing = await this.findOne(id, schoolId)
    if (!existing) throw new NotFoundException('Aluno não encontrado')
    const data = { ...dto } as any
    if (data.document) data.document = normalizeCpf(data.document)
    await this.repo.update({ id, ...(schoolId != null && { school_id: schoolId }) }, data as Partial<Student>)
    return this.findOne(id, schoolId)
  }

  async remove(id: number, schoolId?: number) {
    const existing = await this.findOne(id, schoolId)
    if (!existing) throw new NotFoundException('Aluno não encontrado')
    return this.repo.delete({ id, ...(schoolId != null && { school_id: schoolId }) })
  }

  async updatePhoto(id: number, filename: string, schoolId?: number) {
    const existing = await this.findOne(id, schoolId)
    if (!existing) throw new NotFoundException('Aluno não encontrado')
    await this.repo.update({ id, ...(schoolId != null && { school_id: schoolId }) }, { photo: filename })
    return this.findOne(id, schoolId)
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
