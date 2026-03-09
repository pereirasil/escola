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

  findAll() {
    return this.repo.find({ order: { due_date: 'DESC' } })
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } })
  }

  create(dto: CreatePaymentDto) {
    return this.repo.save(this.repo.create(dto))
  }

  update(id: number, dto: UpdatePaymentDto) {
    return this.repo.update(id, dto as Partial<Payment>).then(() => this.findOne(id))
  }
}
