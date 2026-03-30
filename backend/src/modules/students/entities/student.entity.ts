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

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthly_fee: number

  /** Dia do mês (1-31) em que vence a mensalidade. Ex: 10 = dia 10 de cada mês. */
  @Column({ type: 'int', nullable: true })
  payment_due_day: number

  /** Percentual de multa por atraso. Ex: 2 = 2% sobre o valor. */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  late_fee_percentage: number

  @Column({ nullable: true })
  @Exclude()
  password_hash: string

  /** 'active' | 'inactive' — inativo oculto das listagens principais; sem exclusão física */
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string
}
