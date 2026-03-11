import * as bcrypt from 'bcrypt'
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { Teacher } from './entities/teacher.entity'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'

const SALT_ROUNDS = 10

function normalizeCpf(cpf: string): string {
  return (cpf || '').replace(/\D/g, '')
}

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private repo: Repository<Teacher>,
  ) {}

  findAll(schoolId?: number) {
    const where = schoolId ? { school_id: schoolId } : {}
    return this.repo.find({ where, order: { name: 'ASC' } })
  }

  search(schoolId: number | undefined, query = '', limit = 20) {
    const normalizedQuery = query.trim()
    const qb = this.repo.createQueryBuilder('teacher').orderBy('teacher.name', 'ASC').take(limit)

    if (schoolId) {
      qb.andWhere('teacher.school_id = :schoolId', { schoolId })
    }

    if (normalizedQuery) {
      const digits = normalizeCpf(normalizedQuery)
      qb.andWhere(
        new Brackets((sub) => {
          sub.where('LOWER(teacher.name) LIKE LOWER(:name)', { name: `%${normalizedQuery}%` })
          if (digits) {
            sub.orWhere('teacher.document LIKE :document', { document: `%${digits}%` })
          }
          sub.orWhere('LOWER(teacher.email) LIKE LOWER(:email)', { email: `%${normalizedQuery}%` })
        }),
      )
    }

    return qb.getMany()
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

  findByDocument(cpf: string): Promise<Teacher | null> {
    const normalized = normalizeCpf(cpf)
    return this.repo.findOne({ where: { document: normalized } })
  }

  findAllByDocument(cpf: string): Promise<Teacher[]> {
    const normalized = normalizeCpf(cpf)
    return this.repo.find({ where: { document: normalized } })
  }

  async create(dto: CreateTeacherDto, schoolId?: number) {
    const normalizedDoc = normalizeCpf(dto.document)
    const where: any = { document: normalizedDoc }
    if (schoolId) where.school_id = schoolId
    const existing = await this.repo.findOne({ where })
    if (existing) {
      throw new ConflictException('CPF já cadastrado')
    }
    const hash = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const { password: _, ...rest } = dto
    return this.repo.save(
      this.repo.create({ ...rest, document: normalizedDoc, password_hash: hash, school_id: schoolId }),
    )
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const data = { ...dto } as any
    if (data.document) data.document = normalizeCpf(data.document)
    await this.repo.update(id, data as Partial<Teacher>)
    return this.findOne(id)
  }

  remove(id: number) {
    return this.repo.delete(id)
  }

  async updatePhoto(id: number, filename: string) {
    await this.repo.update(id, { photo: filename })
    return this.findOne(id)
  }

  async updatePassword(teacherId: number, currentPassword: string, newPassword: string) {
    const teacher = await this.findOne(teacherId)
    if (!teacher || !teacher.password_hash) {
      throw new UnauthorizedException('Professor não encontrado ou sem senha definida')
    }
    const valid = await bcrypt.compare(currentPassword, teacher.password_hash)
    if (!valid) {
      throw new UnauthorizedException('Senha atual incorreta')
    }
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await this.repo.update(teacherId, { password_hash: hash })
    return this.findOne(teacherId)
  }
}
