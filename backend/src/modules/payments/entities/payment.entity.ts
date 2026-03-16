import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'
import { Student } from '../../students/entities/student.entity'
import { Invoice } from './invoice.entity'

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ nullable: true })
  school_id: number

  @Column()
  student_id: number

  @Column({ type: 'real' })
  amount: number

  @Column({ nullable: true })
  due_date: string

  @Column({ default: 'pending' })
  status: string

  /** Percentual de multa por atraso (copiado do aluno na criação). */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  late_fee_percentage: number

  /** Indica se a multa já foi aplicada ao amount. */
  @Column({ default: false })
  late_fee_applied: boolean

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student?: Student

  @OneToOne(() => Invoice)
  invoice?: Invoice
}
