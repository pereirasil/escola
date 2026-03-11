import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Class } from './entities/class.entity'
import { Enrollment } from './entities/enrollment.entity'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'
import { Student } from '../students/entities/student.entity'

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private repo: Repository<Class>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
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
      .innerJoin(Enrollment, 'enrollment', 'enrollment.student_id = student.id')
      .where('enrollment.class_id = :classId', { classId: id })
      .orderBy('student.name', 'ASC')
      .distinct(true)

    if (schoolId) {
      qb.andWhere('student.school_id = :schoolId', { schoolId })
      qb.andWhere('enrollment.school_id = :schoolId', { schoolId })
    }

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

  async enrollStudent(classId: number, studentId: number, schoolId?: number) {
    const classEntity = await this.findOne(classId)
    if (!classEntity) throw new NotFoundException('Turma nao encontrada')

    const studentWhere: any = { id: studentId }
    if (schoolId) studentWhere.school_id = schoolId
    const student = await this.studentRepo.findOne({ where: studentWhere })
    if (!student) throw new NotFoundException('Aluno nao encontrado')

    const enrollmentWhere: any = { class_id: classId, student_id: studentId }
    if (schoolId) enrollmentWhere.school_id = schoolId
    const existing = await this.enrollmentRepo.findOne({ where: enrollmentWhere })
    if (existing) {
      throw new ConflictException('Aluno ja matriculado nesta turma')
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
