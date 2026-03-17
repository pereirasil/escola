import { Entity, Column, Unique } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('conversation_reads')
@Unique('conversation_reader', ['conversation_id', 'reader_type', 'reader_id'])
export class ConversationRead extends BaseEntity {
  @Column()
  conversation_id: number

  @Column()
  reader_type: string

  @Column()
  reader_id: number

  @Column({ type: 'datetime' })
  last_read_at: string
}
