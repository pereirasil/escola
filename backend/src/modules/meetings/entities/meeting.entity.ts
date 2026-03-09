import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('meetings')
export class Meeting extends BaseEntity {
  @Column()
  title: string

  @Column({ type: 'datetime', nullable: true })
  scheduled_at: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  class_id: number
}
