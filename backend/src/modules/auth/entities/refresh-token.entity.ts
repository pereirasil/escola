import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

export type JwtSessionPayload = {
  sub: number
  email?: string | null
  role: string
  document?: string | null
  school_id?: number | null
  student_id?: number | null
}

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Column({ type: 'varchar', length: 64, unique: true })
  token_hash: string

  @Column({ type: 'datetime' })
  expires_at: Date

  @Column({ type: 'json' })
  payload_json: JwtSessionPayload

  @Column({ type: 'datetime', nullable: true })
  revoked_at: Date | null
}
