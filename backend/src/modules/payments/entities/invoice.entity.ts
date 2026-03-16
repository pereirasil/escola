import { Entity, Column, OneToOne, JoinColumn } from 'typeorm'
import { Exclude } from 'class-transformer'
import { BaseEntity } from '../../../common/base.entity'
import type { Payment } from './payment.entity'

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ nullable: true })
  school_id: number

  @Column()
  payment_id: number

  @OneToOne('Payment', 'invoice')
  @JoinColumn({ name: 'payment_id' })
  @Exclude()
  payment?: Payment

  @Column({ nullable: true })
  barcode: string

  @Column({ nullable: true })
  linha_digitavel: string

  @Column({ nullable: true })
  boleto_url: string

  @Column({ nullable: true })
  provider_id: string

  @Column({ default: 'pending' })
  status: string
}
