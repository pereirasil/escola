import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Attendance } from './entities/attendance.entity'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'
import { Subject } from '../subjects/entities/subject.entity'

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private repo: Repository<Attendance>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Class)
    private classRepo: Repository<Class>,
  ) {}

  findAll(schoolId?: number) {
    const where = schoolId ? { school_id: schoolId } : {}
    return this.repo.find({ where, order: { date: 'DESC' } })
  }

  findStudentsByTurma(turmaId: number, schoolId?: number) {
    const where: any = { class_id: turmaId }
    if (schoolId) where.school_id = schoolId
    return this.studentRepo.find({ where, order: { name: 'ASC' } })
  }

  async createBulk(dtos: CreateAttendanceDto[], schoolId?: number) {
    const entities = dtos.map(dto => this.repo.create({
      student_id: dto.aluno_id,
      class_id: dto.turma_id,
      subject_id: dto.materia_id,
      teacher_id: dto.teacher_id,
      date: dto.data,
      lesson: dto.aula,
      status: dto.status,
      observation: dto.observacao,
      school_id: schoolId,
    }));
    return this.repo.save(entities);
  }

  async getHistoricoAluno(alunoId: number, schoolId?: number) {
    const where: any = { student_id: alunoId }
    if (schoolId) where.school_id = schoolId
    const presencas = await this.repo.find({
      where,
      order: { date: 'DESC' }
    });

    const total = presencas.length;
    const faltas = presencas.filter(p => p.status === 'F').length;
    const presentes = presencas.filter(p => ['P', 'A', 'J'].includes(p.status)).length;
    const frequencia = total > 0 ? Math.round((presentes / total) * 100) : 100;

    return {
      presencas,
      resumo: {
        total,
        faltas,
        presentes,
        frequencia
      }
    };
  }

  async getFaltasPorTurma(turmaId: number, schoolId?: number) {
    const alunosWhere: any = { class_id: turmaId }
    if (schoolId) alunosWhere.school_id = schoolId
    const alunos = await this.studentRepo.find({ where: alunosWhere });
    const presencasWhere: any = { class_id: turmaId }
    if (schoolId) presencasWhere.school_id = schoolId
    const presencasTurma = await this.repo.find({ where: presencasWhere });

    return alunos.map(aluno => {
      const presencasAluno = presencasTurma.filter(p => p.student_id === aluno.id);
      const total = presencasAluno.length;
      const faltas = presencasAluno.filter(p => p.status === 'F').length;
      const presentes = presencasAluno.filter(p => ['P', 'A', 'J'].includes(p.status)).length;
      const frequencia = total > 0 ? Math.round((presentes / total) * 100) : 100;

      return {
        aluno_id: aluno.id,
        nome: aluno.name,
        presencas: presentes,
        faltas: faltas,
        frequencia: frequencia
      };
    });
  }

  async getRankingFaltas(schoolId?: number) {
    const alunosWhere = schoolId ? { school_id: schoolId } : {}
    const alunos = await this.studentRepo.find({ where: alunosWhere });
    const presencasWhere = schoolId ? { school_id: schoolId } : {}
    const todasPresencas = await this.repo.find({ where: presencasWhere });

    const relatorio = alunos.map(aluno => {
      const presencasAluno = todasPresencas.filter(p => p.student_id === aluno.id);
      const faltas = presencasAluno.filter(p => p.status === 'F').length;
      return {
        aluno_id: aluno.id,
        nome: aluno.name,
        class_id: aluno.class_id,
        faltas: faltas
      };
    });

    return relatorio.sort((a, b) => b.faltas - a.faltas).filter(r => r.faltas > 0);
  }

  async getRankingFaltasByTeacherId(teacherId: number, schoolId?: number) {
    const classesWhere: any = { teacher_id: teacherId }
    if (schoolId) classesWhere.school_id = schoolId
    const classes = await this.classRepo.find({ where: classesWhere })
    const classIds = classes.map((c) => c.id)
    if (classIds.length === 0) return []
    const alunosWhere: any = { class_id: In(classIds) }
    if (schoolId) alunosWhere.school_id = schoolId
    const alunosFiltered = await this.studentRepo.find({ where: alunosWhere })
    const presencasWhere = schoolId ? { school_id: schoolId } : {}
    const todasPresencas = await this.repo.find({ where: presencasWhere })
    const relatorio = alunosFiltered.map((aluno) => {
      const presencasAluno = todasPresencas.filter((p) => p.student_id === aluno.id)
      const faltas = presencasAluno.filter((p) => p.status === 'F').length
      return { aluno_id: aluno.id, nome: aluno.name, class_id: aluno.class_id, faltas }
    })
    return relatorio.sort((a, b) => b.faltas - a.faltas).filter((r) => r.faltas > 0)
  }
}
