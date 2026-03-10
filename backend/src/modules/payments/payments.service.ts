import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Payment } from './entities/payment.entity'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private repo: Repository<Payment>,
  ) {}

  findAll(schoolId?: number) {
    const where = schoolId ? { school_id: schoolId } : {}
    return this.repo.find({ where, order: { due_date: 'DESC' } })
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } })
  }

  create(dto: CreatePaymentDto, schoolId?: number) {
    return this.repo.save(this.repo.create({ ...dto, school_id: schoolId }))
  }

  update(id: number, dto: UpdatePaymentDto) {
    return this.repo.update(id, dto as Partial<Payment>).then(() => this.findOne(id))
  }
}
