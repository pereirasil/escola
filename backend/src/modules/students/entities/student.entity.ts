import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('students')
export class Student extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  document: string

  @Column({ nullable: true })
  birth_date: string

  @Column({ nullable: true })
  guardian_name: string

  @Column({ nullable: true })
  guardian_phone: string

  @Column({ nullable: true })
  address: string

  @Column({ nullable: true })
  class_id: number
}
