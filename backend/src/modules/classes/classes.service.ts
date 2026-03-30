import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Class } from './entities/class.entity'
import { Enrollment } from './entities/enrollment.entity'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'
import { Student } from '../students/entities/student.entity'
import { Schedule } from '../schedules/entities/schedule.entity'
import { Teacher } from '../teachers/entities/teacher.entity'

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private repo: Repository<Class>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
  ) {}

  findAll(schoolId?: number) {
    const where = schoolId ? { school_id: schoolId } : {}
    return this.repo.find({ where, order: { name: 'ASC' } })
  }

  findByTeacherId(teacherId: number, schoolId?: number) {
    const qb = this.repo.createQueryBuilder('c')
      .where(
        '(c.teacher_id = :tid OR c.id IN ' +
        '(SELECT s.class_id FROM schedules s WHERE s.teacher_id = :tid))',
        { tid: teacherId },
      )
    if (schoolId) qb.andWhere('c.school_id = :sid', { sid: schoolId })
    return qb.orderBy('c.name', 'ASC').getMany()
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } })
  }

  async findStudentsByClass(id: number, schoolId?: number) {
    const qb = this.studentRepo
      .createQueryBuilder('student')
      .leftJoin(Enrollment, 'enrollment', 'enrollment.student_id = student.id AND enrollment.class_id = :classId', { classId: id })
      .where('(enrollment.class_id = :classId OR student.class_id = :classId)', { classId: id })
      .orderBy('student.name', 'ASC')
      .distinct(true)

    if (schoolId) {
      qb.andWhere('student.school_id = :schoolId', { schoolId })
    }

    qb.andWhere('(student.status IS NULL OR student.status = :activeSt)', { activeSt: 'active' })

    return qb.getMany()
  }

  async findStudentsByTeacherId(teacherId: number, schoolId?: number) {
    const classes = await this.findByTeacherId(teacherId, schoolId)
    const classIds = classes.map((c) => c.id)
    if (classIds.length === 0) return []
    const qb = this.studentRepo
      .createQueryBuilder('student')
      .leftJoin(Enrollment, 'enrollment', 'enrollment.student_id = student.id')
      .where(
        '(student.class_id IN (:...ids) OR enrollment.class_id IN (:...ids))',
        { ids: classIds },
      )
      .orderBy('student.name', 'ASC')
      .distinct(true)
    if (schoolId) {
      qb.andWhere('student.school_id = :sid', { sid: schoolId })
    }
    qb.andWhere('(student.status IS NULL OR student.status = :activeSt)', { activeSt: 'active' })
    return qb.getMany()
  }

  async getClassIdsByStudent(studentId: number, schoolId?: number): Promise<number[]> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } })
    const ids = new Set<number>()

    if (student?.class_id) ids.add(student.class_id)

    const where: any = { student_id: studentId }
    if (schoolId) where.school_id = schoolId

    const enrollments = await this.enrollmentRepo.find({ where, select: ['class_id'] })
    for (const enrollment of enrollments) {
      ids.add(enrollment.class_id)
    }

    return [...ids]
  }

  async findTeachersByStudentId(studentId: number, schoolId?: number) {
    const classIds = await this.getClassIdsByStudent(studentId, schoolId)
    if (classIds.length === 0) return []
    const teacherIds = new Set<number>()
    const classes = await this.repo.find({ where: { id: In(classIds) }, select: ['teacher_id'] })
    for (const c of classes) {
      if (c.teacher_id) teacherIds.add(c.teacher_id)
    }
    const schedules = await this.scheduleRepo.find({
      where: { class_id: In(classIds) },
      select: ['teacher_id'],
    })
    for (const s of schedules) {
      teacherIds.add(s.teacher_id)
    }
    const ids = [...teacherIds]
    if (ids.length === 0) return []
    const where: any = { id: In(ids) }
    if (schoolId) where.school_id = schoolId
    return this.teacherRepo.find({
      where,
      select: ['id', 'name'],
      order: { name: 'ASC' },
    })
  }

  async enrollStudent(classId: number, studentId: number, schoolId?: number) {
    const classEntity = await this.findOne(classId)
    if (!classEntity) throw new NotFoundException('Turma não encontrada')

    const studentWhere: any = { id: studentId }
    if (schoolId) studentWhere.school_id = schoolId
    const student = await this.studentRepo.findOne({ where: studentWhere })
    if (!student) throw new NotFoundException('Aluno não encontrado')

    const enrollmentWhere: any = { class_id: classId, student_id: studentId }
    if (schoolId) enrollmentWhere.school_id = schoolId
    const existing = await this.enrollmentRepo.findOne({ where: enrollmentWhere })
    if (existing) {
      throw new ConflictException('Aluno já matriculado nesta turma')
    }

    return this.enrollmentRepo.save(
      this.enrollmentRepo.create({
        class_id: classId,
        student_id: studentId,
        school_id: schoolId,
      }),
    )
  }

  async removeEnrollment(classId: number, studentId: number, schoolId?: number) {
    const where: any = { class_id: classId, student_id: studentId }
    if (schoolId) where.school_id = schoolId
    return this.enrollmentRepo.delete(where)
  }

  create(dto: CreateClassDto, schoolId?: number) {
    return this.repo.save(this.repo.create({ ...dto, school_id: schoolId }))
  }

  update(id: number, dto: UpdateClassDto) {
    return this.repo.update(id, dto as Partial<Class>).then(() => this.findOne(id))
  }

  remove(id: number) {
    return this.repo.delete(id)
  }
}
