import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('enrollments')
export class Enrollment extends BaseEntity {
  @Column({ nullable: true })
  school_id: number

  @Column()
  student_id: number

  @Column()
  class_id: number
}
