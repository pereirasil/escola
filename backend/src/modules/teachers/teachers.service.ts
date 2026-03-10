import * as bcrypt from 'bcrypt'
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
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

  findOne(id: number) {
    return this.repo.findOne({ where: { id } })
  }

  findByDocument(cpf: string): Promise<Teacher | null> {
    const normalized = normalizeCpf(cpf)
    return this.repo.findOne({ where: { document: normalized } })
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
    const { password: _, class_ids: _ci, ...rest } = dto
    return this.repo.save(
      this.repo.create({ ...rest, document: normalizedDoc, password_hash: hash, school_id: schoolId }),
    )
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const { class_ids: _, ...data } = dto as any
    await this.repo.update(id, data as Partial<Teacher>)
    return this.findOne(id)
  }

  remove(id: number) {
    return this.repo.delete(id)
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
