import { Entity, Column, Index } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('conversations')
@Index('conversations_student_id', ['student_id'])
@Index('conversations_school_id', ['school_id'])
@Index('conversations_teacher_id', ['teacher_id'])
@Index('conversations_last_message_at', ['last_message_at'])
export class Conversation extends BaseEntity {
  @Column({ nullable: true })
  school_id: number

  @Column({ nullable: true })
  teacher_id: number

  @Column()
  student_id: number

  @Column()
  subject: string

  @Column({ default: 'open' })
  status: string

  @Column({ type: 'datetime', nullable: true })
  last_message_at: string

  @Column({ type: 'datetime', nullable: true })
  closed_at: string
}
