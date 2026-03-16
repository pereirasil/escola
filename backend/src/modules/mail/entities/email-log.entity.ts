import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('email_logs')
export class EmailLog extends BaseEntity {
  @Column()
  to: string

  @Column()
  subject: string

  @Column({ default: 'sent' })
  status: string

  @Column({ type: 'text', nullable: true })
  error: string

  @Column({ nullable: true })
  school_id: number
}
