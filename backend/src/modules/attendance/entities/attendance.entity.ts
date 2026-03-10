import { Entity, Column, Unique } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('presencas')
@Unique(['student_id', 'subject_id', 'date', 'lesson'])
export class Attendance extends BaseEntity {
  @Column({ nullable: true })
  school_id: number

  @Column({ name: 'aluno_id' })
  student_id: number

  @Column({ name: 'turma_id' })
  class_id: number

  @Column({ name: 'materia_id' })
  subject_id: number

  @Column({ type: 'date', name: 'data' })
  date: string

  @Column({ name: 'aula' })
  lesson: string

  @Column({ type: 'varchar', length: 1 })
  status: string

  @Column({ type: 'text', nullable: true, name: 'observacao' })
  observation?: string
}
