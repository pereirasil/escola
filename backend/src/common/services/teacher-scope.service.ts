import { Injectable, ForbiddenException, Scope, Inject } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { Request } from 'express'
import { ClassesService } from '../../modules/classes/classes.service'
import { StudentsService } from '../../modules/students/students.service'
import { SchedulesService } from '../../modules/schedules/schedules.service'

interface UserContext {
  id: number
  role: string
  school_id?: number
}

@Injectable({ scope: Scope.REQUEST })
export class TeacherScopeService {
  private classIdsCache: number[] | null = null
  private subjectMapCache: Map<number, number[]> | null = null

  constructor(
    @Inject(REQUEST) private request: Request,
    private classesService: ClassesService,
    private studentsService: StudentsService,
    private schedulesService: SchedulesService,
  ) {}

  private async loadTeacherScope(user: UserContext): Promise<void> {
    if (this.classIdsCache !== null) return

    const [ownedClasses, schedules] = await Promise.all([
      this.classesService.findByTeacherId(user.id, user.school_id),
      this.schedulesService.findByTeacherId(user.id, user.school_id),
    ])

    const classIdSet = new Set(ownedClasses.map((c) => c.id))
    const subjectMap = new Map<number, number[]>()

    for (const s of schedules) {
      classIdSet.add(s.class_id)
      const existing = subjectMap.get(s.class_id) || []
      existing.push(s.subject_id)
      subjectMap.set(s.class_id, existing)
    }

    this.classIdsCache = [...classIdSet]
    this.subjectMapCache = subjectMap
  }

  async getTeacherClassIds(user: UserContext): Promise<number[]> {
    if (user.role !== 'teacher') return []
    await this.loadTeacherScope(user)
    return this.classIdsCache!
  }

  async ensureClassAccess(user: UserContext, classId: number): Promise<void> {
    if (user.role !== 'teacher') return
    await this.loadTeacherScope(user)
    if (!this.classIdsCache!.includes(classId)) {
      throw new ForbiddenException('Acesso negado a esta turma')
    }
  }

  async ensureClassSubjectAccess(user: UserContext, classId: number, subjectId: number): Promise<void> {
    if (user.role !== 'teacher') return
    await this.loadTeacherScope(user)
    if (!this.classIdsCache!.includes(classId)) {
      throw new ForbiddenException('Acesso negado a esta turma')
    }
    const subjects = this.subjectMapCache!.get(classId)
    if (subjects && !subjects.includes(subjectId)) {
      throw new ForbiddenException('Acesso negado a esta matéria nesta turma')
    }
  }

  async ensureStudentAccess(user: UserContext, studentId: number): Promise<void> {
    if (user.role !== 'teacher') return
    const student = await this.studentsService.findOne(studentId)
    if (!student) {
      throw new ForbiddenException('Aluno não encontrado')
    }
    const classIds = await this.classesService.getClassIdsByStudent(studentId, user.school_id)
    if (classIds.length === 0) {
      throw new ForbiddenException('Aluno não encontrado ou sem turma')
    }
    const teacherClassIds = await this.getTeacherClassIds(user)
    if (!classIds.some((classId) => teacherClassIds.includes(classId))) {
      throw new ForbiddenException('Acesso negado a este aluno')
    }
  }
}
