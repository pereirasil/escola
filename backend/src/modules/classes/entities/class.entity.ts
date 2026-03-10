import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('classes')
export class Class extends BaseEntity {
  @Column({ nullable: true })
  school_id: number

  @Column()
  name: string

  @Column({ nullable: true })
  grade: string

  @Column({ nullable: true })
  shift: string

  @Column({ nullable: true })
  room: string

  @Column({ nullable: true })
  school_year: string

  @Column({ nullable: true })
  teacher_id: number
}
