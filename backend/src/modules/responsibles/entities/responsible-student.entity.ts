import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'
import { Responsible } from './responsible.entity'
import { Student } from '../../students/entities/student.entity'

@Entity('responsible_students')
export class ResponsibleStudent extends BaseEntity {
  @Column()
  responsible_id: number

  @Column()
  student_id: number

  @ManyToOne(() => Responsible, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'responsible_id' })
  responsible: Responsible

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student
}
