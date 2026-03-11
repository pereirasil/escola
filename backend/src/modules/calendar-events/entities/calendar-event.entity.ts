import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('calendar_events')
export class CalendarEvent extends BaseEntity {
  @Column({ nullable: true })
  school_id: number

  @Column()
  title: string

  @Column({ nullable: true })
  description: string

  @Column()
  date: string

  @Column({ type: 'text' })
  series: string
}
