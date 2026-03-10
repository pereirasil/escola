import { Entity, Column, Unique } from 'typeorm'
import { BaseEntity } from '../../../common/base.entity'

@Entity('notas')
@Unique(['aluno_id', 'materia_id', 'bimestre'])
export class Grade extends BaseEntity {
  @Column({ nullable: true })
  school_id: number

  @Column()
  aluno_id: number

  @Column()
  turma_id: number

  @Column()
  materia_id: number

  @Column({ nullable: true })
  teacher_id: number

  @Column({ type: 'real', default: 0 })
  nota: number

  @Column()
  bimestre: string
}
