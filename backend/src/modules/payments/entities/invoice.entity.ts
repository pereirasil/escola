import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column()
  payment_id: number

  @Column({ nullable: true })
  barcode: string

  @Column({ default: 'pending' })
  status: string
}
