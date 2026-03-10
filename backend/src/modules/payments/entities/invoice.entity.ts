import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ nullable: true })
  school_id: number

  @Column()
  payment_id: number

  @Column({ nullable: true })
  barcode: string

  @Column({ default: 'pending' })
  status: string
}
