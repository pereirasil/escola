import { Entity, Column, Index } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('conversation_messages')
@Index('conversation_messages_conversation_id', ['conversation_id'])
export class ConversationMessage extends BaseEntity {
  @Column()
  conversation_id: number

  @Column()
  sender_type: string

  @Column()
  sender_id: number

  @Column({ type: 'text' })
  message: string
}
