import { Entity, Column } from 'typeorm'
import { Exclude } from 'class-transformer'
import { BaseEntity } from '../../../common/base.entity'

@Entity('teachers')
export class Teacher extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  document: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  subject: string

  @Column({ nullable: true })
  class_id: number

  @Column({ nullable: true })
  @Exclude()
  password_hash: string
}
