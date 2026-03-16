import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BankAccount } from './entities/bank-account.entity'
import { CreateBankAccountDto } from './dto/create-bank-account.dto'
import { UpdateBankAccountDto } from './dto/update-bank-account.dto'

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private repo: Repository<BankAccount>,
  ) {}

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } })
  }

  findBySchool(schoolId: number) {
    return this.repo.find({
      where: { school_id: schoolId },
      order: { id: 'DESC' },
    })
  }

  findOne(id: number, schoolId?: number) {
    const where: Record<string, unknown> = { id }
    if (schoolId != null) where.school_id = schoolId
    return this.repo.findOne({ where })
  }

  create(dto: CreateBankAccountDto, schoolId: number) {
    return this.repo.save(this.repo.create({ ...dto, school_id: schoolId }))
  }

  async update(id: number, dto: UpdateBankAccountDto, schoolId?: number) {
    const existing = await this.findOne(id, schoolId)
    if (!existing) return null
    await this.repo.update(id, dto as Partial<BankAccount>)
    return this.findOne(id, schoolId)
  }

  async remove(id: number, schoolId?: number) {
    const existing = await this.findOne(id, schoolId)
    if (!existing) return null
    await this.repo.delete(id)
    return { deleted: true }
  }
}
