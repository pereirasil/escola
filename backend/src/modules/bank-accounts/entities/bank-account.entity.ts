import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('bank_accounts')
export class BankAccount extends BaseEntity {
  @Column()
  school_id: number

  @Column()
  bank_code: string

  @Column({ nullable: true })
  bank_name: string

  @Column()
  agency: string

  @Column({ nullable: true })
  agency_digit: string

  @Column()
  account: string

  @Column({ nullable: true })
  account_digit: string

  @Column({ default: 'corrente' })
  account_type: string

  @Column()
  beneficiary_name: string

  @Column()
  document: string

  @Column({ nullable: true })
  pix_key: string
}
