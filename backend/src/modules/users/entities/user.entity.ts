import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('users')
export class User extends BaseEntity {
  @Column()
  email: string

  @Column()
  password_hash: string

  @Column({ nullable: true })
  name: string

  @Column({ default: 'school' })
  role: string

  @Column({ type: 'integer', default: 0 })
  approved: number
}
