import { Entity, Column } from 'typeorm'
import { Exclude } from 'class-transformer'
import { BaseEntity } from '../../../common/base.entity'

@Entity('students')
export class Student extends BaseEntity {
  @Column({ nullable: true })
  school_id: number

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
  state: string

  @Column({ nullable: true })
  city: string

  @Column({ nullable: true })
  neighborhood: string

  @Column({ nullable: true })
  street: string

  @Column({ nullable: true })
  number: string

  @Column({ nullable: true })
  complement: string

  @Column({ nullable: true })
  cep: string

  @Column({ nullable: true })
  guardian_document: string

  @Column({ nullable: true })
  photo: string

  @Column({ nullable: true })
  class_id: number

  @Column({ nullable: true })
  @Exclude()
  password_hash: string
}
