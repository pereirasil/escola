import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
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
  ) {}

  findAll() {
    return this.repo.find({ order: { date: 'DESC' } })
  }

  findStudentsByTurma(turmaId: number) {
    return this.studentRepo.find({ where: { class_id: turmaId }, order: { name: 'ASC' } })
  }

  async createBulk(dtos: CreateAttendanceDto[]) {
    const entities = dtos.map(dto => this.repo.create({
      student_id: dto.aluno_id,
      class_id: dto.turma_id,
      subject_id: dto.materia_id,
      date: dto.data,
      lesson: dto.aula,
      status: dto.status,
      observation: dto.observacao,
    }));
    return this.repo.save(entities);
  }

  // --- Relatórios e Histórico ---

  async getHistoricoAluno(alunoId: number) {
    // Traz o histórico detalhado do aluno (JOIN manual usando queryBuilder se necessário ou lookup manual)
    // Para simplificar, buscamos as presenças e agregamos:
    const presencas = await this.repo.find({
      where: { student_id: alunoId },
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

  async getFaltasPorTurma(turmaId: number) {
    // Agrupa faltas e presenças de todos os alunos de uma turma
    const alunos = await this.studentRepo.find({ where: { class_id: turmaId } });
    const presencasTurma = await this.repo.find({ where: { class_id: turmaId } });

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

  async getRankingFaltas() {
    // Traz o ranking geral de faltas de toda a escola
    const alunos = await this.studentRepo.find();
    const todasPresencas = await this.repo.find();

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

    // Ordena de quem tem mais faltas para quem tem menos
    return relatorio.sort((a, b) => b.faltas - a.faltas).filter(r => r.faltas > 0);
  }
}
