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

  findAll(schoolId?: number) {
    const where = schoolId ? { school_id: schoolId } : {}
    return this.repo.find({ where, order: { id: 'DESC' } })
  }

  findStudentsByTurma(turmaId: number, schoolId?: number) {
    const where: any = { class_id: turmaId }
    if (schoolId) where.school_id = schoolId
    return this.studentRepo.find({ where, order: { name: 'ASC' } })
  }

  findByFilters(turmaId: number, materiaId: number, bimestre: string, schoolId?: number) {
    const where: any = {
      turma_id: turmaId,
      materia_id: materiaId,
      bimestre: bimestre
    }
    if (schoolId) where.school_id = schoolId
    return this.repo.find({ where })
  }

  findByAluno(alunoId: number, schoolId?: number) {
    const where: any = { aluno_id: alunoId }
    if (schoolId) where.school_id = schoolId
    return this.repo.find({ where })
  }

  async createBulk(dtos: CreateGradeDto[], schoolId?: number) {
    if (dtos.length > 0) {
      const { turma_id, materia_id, bimestre } = dtos[0];
      const deleteWhere: any = { turma_id, materia_id, bimestre }
      if (schoolId) deleteWhere.school_id = schoolId
      await this.repo.delete(deleteWhere);
    }

    const entities = dtos.map(dto => this.repo.create({ ...dto, school_id: schoolId }));
    return this.repo.save(entities);
  }
}
