import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Attendance } from './entities/attendance.entity'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'
import { Enrollment } from '../classes/entities/enrollment.entity'
import { SchedulesService } from '../schedules/schedules.service'
import { SubjectsService } from '../subjects/subjects.service'

export type HistoricoPresencaRegistro = {
  data: string
  materia_id: number
  materia_nome: string
  aula: string
  status: string
  observacao: string | null
}

export type HistoricoPresencaAluno = {
  aluno_id: number
  nome: string
  total_registros: number
  faltas: number
  presencas_contagem: number
  frequencia_percentual: number
  alerta_faltas: boolean
  registros: HistoricoPresencaRegistro[]
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private repo: Repository<Attendance>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Class)
    private classRepo: Repository<Class>,
    private schedulesService: SchedulesService,
    private subjectsService: SubjectsService,
  ) {}

  findAll(schoolId?: number, page = 1, limit = 50) {
    const where = schoolId ? { school_id: schoolId } : {}
    return this.repo.find({
      where,
      order: { date: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })
  }

  findStudentsByTurma(turmaId: number, schoolId?: number) {
    const qb = this.studentRepo
      .createQueryBuilder('student')
      .leftJoin(Enrollment, 'enrollment', 'enrollment.student_id = student.id AND enrollment.class_id = :turmaId', { turmaId })
      .where('(enrollment.class_id = :turmaId OR student.class_id = :turmaId)', { turmaId })
      .orderBy('student.name', 'ASC')
      .distinct(true)

    if (schoolId) {
      qb.andWhere('student.school_id = :schoolId', { schoolId })
    }

    qb.andWhere('(student.status IS NULL OR student.status = :activeSt)', { activeSt: 'active' })

    return qb.getMany()
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
    }))
    await this.repo.upsert(entities, ['student_id', 'subject_id', 'date', 'lesson'])
    return { saved: entities.length }
  }

  async getHistoricoAluno(alunoId: number, schoolId?: number) {
    const qb = this.repo.createQueryBuilder('p')
      .where('p.student_id = :alunoId', { alunoId })
    if (schoolId) qb.andWhere('p.school_id = :schoolId', { schoolId })

    const resumo = await qb
      .select('COUNT(*)', 'total')
      .addSelect("SUM(CASE WHEN p.status = 'F' THEN 1 ELSE 0 END)", 'faltas')
      .addSelect("SUM(CASE WHEN p.status IN ('P','A','J') THEN 1 ELSE 0 END)", 'presentes')
      .getRawOne()

    const total = Number(resumo.total) || 0
    const faltas = Number(resumo.faltas) || 0
    const presentes = Number(resumo.presentes) || 0
    const frequencia = total > 0 ? Math.round((presentes / total) * 100) : 100

    const qbList = this.repo.createQueryBuilder('p')
      .where('p.student_id = :alunoId', { alunoId })
      .orderBy('p.date', 'DESC')
    if (schoolId) qbList.andWhere('p.school_id = :schoolId', { schoolId })

    const presencas = await qbList.getMany()

    return {
      presencas,
      resumo: { total, faltas, presentes, frequencia },
    }
  }

  async getFaltasPorTurma(turmaId: number, schoolId?: number) {
    const qb = this.repo.createQueryBuilder('p')
      .innerJoin(Student, 's', 's.id = p.student_id')
      .where('p.class_id = :turmaId', { turmaId })
      .groupBy('p.student_id')
      .addGroupBy('s.name')
      .select('p.student_id', 'aluno_id')
      .addSelect('s.name', 'nome')
      .addSelect('COUNT(*)', 'total')
      .addSelect("SUM(CASE WHEN p.status = 'F' THEN 1 ELSE 0 END)", 'faltas')
      .addSelect("SUM(CASE WHEN p.status IN ('P','A','J') THEN 1 ELSE 0 END)", 'presencas')
    if (schoolId) qb.andWhere('p.school_id = :schoolId', { schoolId })

    const rows = await qb.getRawMany()

    return rows.map(row => {
      const total = Number(row.total) || 0
      const faltas = Number(row.faltas) || 0
      const presencas = Number(row.presencas) || 0
      const frequencia = total > 0 ? Math.round((presencas / total) * 100) : 100
      return {
        aluno_id: Number(row.aluno_id),
        nome: row.nome,
        presencas,
        faltas,
        frequencia,
      }
    })
  }

  async getRankingFaltas(schoolId?: number) {
    const qb = this.repo.createQueryBuilder('p')
      .innerJoin(Student, 's', 's.id = p.student_id')
      .where("p.status = 'F'")
      .groupBy('p.student_id')
      .addGroupBy('s.name')
      .addGroupBy('s.class_id')
      .select('p.student_id', 'aluno_id')
      .addSelect('s.name', 'nome')
      .addSelect('s.class_id', 'class_id')
      .addSelect('COUNT(*)', 'faltas')
      .orderBy('faltas', 'DESC')
    if (schoolId) qb.andWhere('p.school_id = :schoolId', { schoolId })

    qb.andWhere('(s.status IS NULL OR s.status = :activeSt)', { activeSt: 'active' })

    const rows = await qb.getRawMany()

    return rows.map(row => ({
      aluno_id: Number(row.aluno_id),
      nome: row.nome,
      class_id: Number(row.class_id),
      faltas: Number(row.faltas),
    }))
  }

  async getRankingFaltasByTeacherId(teacherId: number, schoolId?: number) {
    const classesWhere: any = { teacher_id: teacherId }
    if (schoolId) classesWhere.school_id = schoolId
    const classes = await this.classRepo.find({ where: classesWhere })
    const classIds = classes.map((c) => c.id)
    if (classIds.length === 0) return []

    const qb = this.repo.createQueryBuilder('p')
      .innerJoin(Student, 's', 's.id = p.student_id')
      .where("p.status = 'F'")
      .andWhere('p.class_id IN (:...classIds)', { classIds })
      .groupBy('p.student_id')
      .addGroupBy('s.name')
      .addGroupBy('s.class_id')
      .select('p.student_id', 'aluno_id')
      .addSelect('s.name', 'nome')
      .addSelect('s.class_id', 'class_id')
      .addSelect('COUNT(*)', 'faltas')
      .orderBy('faltas', 'DESC')
    if (schoolId) qb.andWhere('p.school_id = :schoolId', { schoolId })

    qb.andWhere('(s.status IS NULL OR s.status = :activeSt)', { activeSt: 'active' })

    const rows = await qb.getRawMany()

    return rows.map(row => ({
      aluno_id: Number(row.aluno_id),
      nome: row.nome,
      class_id: Number(row.class_id),
      faltas: Number(row.faltas),
    }))
  }

  /**
   * Histórico por turma. Professor: só registros das matérias que leciona (grade horária).
   * Demais perfis: todos os registros da turma na escola.
   */
  async getHistoricoTurmaDetalhe(
    user: { id: number; role: string; school_id?: number },
    turmaId: number,
    schoolId: number | undefined,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<{ alunos: HistoricoPresencaAluno[] }> {
    let subjectIds: number[] | null = null
    if (user.role === 'teacher') {
      const schedules = await this.schedulesService.findByTeacherId(user.id, schoolId)
      subjectIds = [...new Set(schedules.filter((s) => s.class_id === turmaId).map((s) => s.subject_id))]
      if (subjectIds.length === 0) {
        return { alunos: [] }
      }
    }

    const qb = this.repo
      .createQueryBuilder('p')
      .innerJoin(Student, 'stu', 'stu.id = p.student_id')
      .where('p.class_id = :turmaId', { turmaId })
      .andWhere('(stu.status IS NULL OR stu.status = :activeSt)', { activeSt: 'active' })

    if (schoolId) qb.andWhere('p.school_id = :schoolId', { schoolId })
    if (subjectIds) qb.andWhere('p.subject_id IN (:...subjectIds)', { subjectIds })
    if (dataInicio) qb.andWhere('p.date >= :di', { di: dataInicio })
    if (dataFim) qb.andWhere('p.date <= :df', { df: dataFim })

    qb.orderBy('stu.name', 'ASC').addOrderBy('p.date', 'DESC').addOrderBy('p.lesson', 'ASC')

    const rows = await qb
      .select('p.student_id', 'aluno_id')
      .addSelect('stu.name', 'nome')
      .addSelect('p.subject_id', 'materia_id')
      .addSelect('p.date', 'data')
      .addSelect('p.lesson', 'aula')
      .addSelect('p.status', 'status')
      .addSelect('p.observation', 'observacao')
      .getRawMany()

    const subjects = await this.subjectsService.findAll(schoolId)
    const subjectName = new Map(subjects.map((s) => [s.id, s.name]))

    const byAluno = new Map<number, HistoricoPresencaAluno>()

    for (const raw of rows as Record<string, string | number | null>[]) {
      const alunoId = Number(raw.aluno_id)
      let block = byAluno.get(alunoId)
      if (!block) {
        block = {
          aluno_id: alunoId,
          nome: String(raw.nome ?? ''),
          total_registros: 0,
          faltas: 0,
          presencas_contagem: 0,
          frequencia_percentual: 100,
          alerta_faltas: false,
          registros: [],
        }
        byAluno.set(alunoId, block)
      }
      const mid = Number(raw.materia_id)
      const reg: HistoricoPresencaRegistro = {
        data: String(raw.data ?? ''),
        materia_id: mid,
        materia_nome: subjectName.get(mid) || `Matéria ${mid}`,
        aula: String(raw.aula ?? ''),
        status: String(raw.status ?? ''),
        observacao: raw.observacao != null ? String(raw.observacao) : null,
      }
      block.registros.push(reg)
    }

    for (const block of byAluno.values()) {
      block.total_registros = block.registros.length
      block.faltas = block.registros.filter((r) => r.status === 'F').length
      block.presencas_contagem = block.registros.filter((r) => ['P', 'A', 'J'].includes(r.status)).length
      const t = block.total_registros
      block.frequencia_percentual = t > 0 ? Math.round((block.presencas_contagem / t) * 100) : 100
      block.alerta_faltas = block.faltas >= 3
    }

    const alunos = [...byAluno.values()].sort((a, b) => a.nome.localeCompare(b.nome))
    return { alunos }
  }
}
