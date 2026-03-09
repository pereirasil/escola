import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('payments')
export class Payment extends BaseEntity {
  @Column()
  student_id: number

  @Column({ type: 'real' })
  amount: number

  @Column({ nullable: true })
  due_date: string

  @Column({ default: 'pending' })
  status: string
}
