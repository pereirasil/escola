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

  @Column({ nullable: true })
  responsible_name: string

  @Column({ nullable: true })
  cnpj: string

  @Column({ nullable: true })
  phone: string

  /** Token OAuth do Mercado Pago (conta conectada pela escola). Nunca expor no frontend. */
  @Column({ type: 'text', nullable: true })
  mercadopago_access_token: string | null

  /** user_id retornado pelo Mercado Pago no OAuth. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  mercadopago_user_id: string | null
}
