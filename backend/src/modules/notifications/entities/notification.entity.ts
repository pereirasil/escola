import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column()
  student_id: number

  @Column()
  title: string

  @Column({ type: 'text', nullable: true })
  message: string

  @Column({ default: 'meeting' })
  type: string

  @Column({ nullable: true })
  reference_id: number

  @Column({ type: 'datetime', nullable: true })
  read_at: string
}
