import { Entity, Column } from 'typeorm'
import { Exclude } from 'class-transformer'
import { BaseEntity } from '../../../common/base.entity'

@Entity('responsibles')
export class Responsible extends BaseEntity {
  @Column()
  name: string

  @Column({ unique: true })
  cpf: string

  @Column()
  @Exclude()
  password_hash: string
}
