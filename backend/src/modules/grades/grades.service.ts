import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Grade } from './entities/grade.entity'
import { CreateGradeDto } from './dto/create-grade.dto'
import { Student } from '../students/entities/student.entity'

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private repo: Repository<Grade>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {}

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } })
  }

  // Busca alunos de uma turma específica
  findStudentsByTurma(turmaId: number) {
    return this.studentRepo.find({ where: { class_id: turmaId }, order: { name: 'ASC' } })
  }

  // Busca notas por turma, matéria e bimestre para preencher a tela de lançamento
  findByFilters(turmaId: number, materiaId: number, bimestre: string) {
    return this.repo.find({
      where: {
        turma_id: turmaId,
        materia_id: materiaId,
        bimestre: bimestre
      }
    })
  }

  // Busca notas de um aluno para o boletim
  findByAluno(alunoId: number) {
    return this.repo.find({ where: { aluno_id: alunoId } })
  }

  async createBulk(dtos: CreateGradeDto[]) {
    // Como tem Unique['aluno_id', 'materia_id', 'bimestre'], seria bom fazer upsert ou checar antes.
    // Usaremos upsert ou delete/insert para simplificar.
    
    // Deleta as notas anteriores para esta combinação (se existirem) para atualizar
    if (dtos.length > 0) {
      const { turma_id, materia_id, bimestre } = dtos[0];
      await this.repo.delete({ turma_id, materia_id, bimestre });
    }

    const entities = dtos.map(dto => this.repo.create(dto));
    return this.repo.save(entities);
  }
}
