import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('subjects')
export class Subject extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  duration_minutes: number
}
