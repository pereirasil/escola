import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('student_messages')
export class StudentMessage extends BaseEntity {
  @Column()
  student_id: number

  @Column({ nullable: true })
  school_id: number

  @Column()
  subject: string

  @Column({ type: 'text' })
  message: string

  @Column({ type: 'text', nullable: true })
  response: string

  @Column({ default: 'pending' })
  status: string

  @Column({ type: 'datetime', nullable: true })
  responded_at: string
}
