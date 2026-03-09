import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('schedules')
export class Schedule extends BaseEntity {
  @Column()
  class_id: number

  @Column()
  teacher_id: number

  @Column()
  subject_id: number

  @Column()
  day_of_week: string

  @Column()
  start_time: string

  @Column()
  end_time: string

  @Column({ nullable: true })
  room: string
}
