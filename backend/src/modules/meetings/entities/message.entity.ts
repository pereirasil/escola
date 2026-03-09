import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('messages')
export class Message extends BaseEntity {
  @Column()
  title: string

  @Column({ type: 'text', nullable: true })
  body: string

  @Column({ nullable: true })
  recipient_type: string

  @Column({ nullable: true })
  recipient_id: number
}
