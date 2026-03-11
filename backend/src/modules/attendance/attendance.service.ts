import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Attendance } from './entities/attendance.entity'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'
import { Enrollment } from '../classes/entities/enrollment.entity'

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
      .innerJoin(Enrollment, 'enrollment', 'enrollment.student_id = student.id')
      .where('enrollment.class_id = :turmaId', { turmaId })
      .orderBy('student.name', 'ASC')
      .distinct(true)

    if (schoolId) {
      qb.andWhere('student.school_id = :schoolId', { schoolId })
      qb.andWhere('enrollment.school_id = :schoolId', { schoolId })
    }

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
      .take(50)
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

    const rows = await qb.getRawMany()

    return rows.map(row => ({
      aluno_id: Number(row.aluno_id),
      nome: row.nome,
      class_id: Number(row.class_id),
      faltas: Number(row.faltas),
    }))
  }
}
