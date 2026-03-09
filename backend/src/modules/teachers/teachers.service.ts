import * as bcrypt from 'bcrypt'
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Teacher } from './entities/teacher.entity'
import { Class } from '../classes/entities/class.entity'
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
    @InjectRepository(Class)
    private classRepo: Repository<Class>,
  ) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } })
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } })
  }

  findByDocument(cpf: string): Promise<Teacher | null> {
    const normalized = normalizeCpf(cpf)
    return this.repo.findOne({ where: { document: normalized } })
  }

  async create(dto: CreateTeacherDto) {
    const normalizedDoc = normalizeCpf(dto.document)
    const existing = await this.repo.findOne({ where: { document: normalizedDoc } })
    if (existing) {
      throw new ConflictException('CPF já cadastrado')
    }
    const hash = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const { password: _, class_ids, ...rest } = dto
    const teacher = await this.repo.save(
      this.repo.create({ ...rest, document: normalizedDoc, password_hash: hash }),
    )
    if (class_ids?.length) {
      await this.classRepo.update({ id: In(class_ids) }, { teacher_id: teacher.id })
    }
    return teacher
  }

  update(id: number, dto: UpdateTeacherDto) {
    return this.repo.update(id, dto as Partial<Teacher>).then(() => this.findOne(id))
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
