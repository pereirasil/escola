import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('enrollments')
export class Enrollment extends BaseEntity {
  @Column()
  student_id: number

  @Column()
  class_id: number
}
