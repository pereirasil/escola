import * as bcrypt from 'bcrypt'
import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, In, Repository } from 'typeorm'
import { Teacher } from './entities/teacher.entity'
import { User } from '../users/entities/user.entity'
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
    const qb = this.repo.createQueryBuilder('teacher').orderBy('teacher.name', 'ASC').take(limit)

    if (schoolId != null) {
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

  findByDocument(cpf: string): Promise<Teacher | null> {
    const normalized = normalizeCpf(cpf)
    return this.repo.findOne({ where: { document: normalized } })
  }

  findAllByDocument(cpf: string): Promise<Teacher[]> {
    const normalized = normalizeCpf(cpf)
    return this.repo.find({ where: { document: normalized } })
  }

  findByDocumentAndSchool(cpf: string, schoolId: number): Promise<Teacher | null> {
    const normalized = normalizeCpf(cpf)
    return this.repo.findOne({ where: { document: normalized, school_id: schoolId } })
  }

  async getSchoolsForTeachers(teachers: Teacher[]): Promise<{ id: number; name: string }[]> {
    const schoolIds = [...new Set(teachers.map((t) => t.school_id).filter(Boolean))] as number[]
    if (schoolIds.length === 0) return []
    const schools = await this.userRepo.find({
      where: { id: In(schoolIds), role: 'school' },
      select: ['id', 'name'],
    })
    return schools.map((s) => ({ id: s.id, name: s.name || `Escola ${s.id}` }))
  }

  async create(dto: CreateTeacherDto, schoolId?: number) {
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
    return this.repo.save(
      this.repo.create({ ...rest, document: normalizedDoc, password_hash: hash, school_id: schoolId }),
    )
  }

  async update(id: number, dto: UpdateTeacherDto, schoolId?: number) {
    const existing = await this.findOne(id, schoolId)
    if (!existing) throw new NotFoundException('Professor não encontrado')
    const data = { ...dto } as any
    if (data.document) data.document = normalizeCpf(data.document)
    await this.repo.update({ id, ...(schoolId != null && { school_id: schoolId }) }, data as Partial<Teacher>)
    return this.findOne(id, schoolId)
  }

  async remove(id: number, schoolId?: number) {
    const existing = await this.findOne(id, schoolId)
    if (!existing) throw new NotFoundException('Professor não encontrado')
    return this.repo.delete({ id, ...(schoolId != null && { school_id: schoolId }) })
  }

  async updatePhoto(id: number, filename: string, schoolId?: number) {
    const existing = await this.findOne(id, schoolId)
    if (!existing) throw new NotFoundException('Professor não encontrado')
    await this.repo.update({ id, ...(schoolId != null && { school_id: schoolId }) }, { photo: filename })
    return this.findOne(id, schoolId)
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

  async getHeaderInfo(teacherId: number): Promise<{ teacher_name: string | null; school_name: string | null }> {
    const teacher = await this.findOne(teacherId)
    if (!teacher) return { teacher_name: null, school_name: null }
    let school_name: string | null = null
    if (teacher.school_id) {
      const school = await this.userRepo.findOne({
        where: { id: teacher.school_id, role: 'school' },
        select: ['name'],
      })
      school_name = school?.name ?? null
    }
    return {
      teacher_name: teacher.name ?? null,
      school_name,
    }
  }
}
