import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { StudentMessage } from './entities/student-message.entity'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'

@Injectable()
export class StudentMessagesService {
  constructor(
    @InjectRepository(StudentMessage)
    private repo: Repository<StudentMessage>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Class)
    private classRepo: Repository<Class>,
  ) {}

  async create(studentId: number, subject: string, message: string, schoolId?: number) {
    const sid = schoolId ?? (await this.studentRepo.findOne({ where: { id: studentId }, select: ['school_id'] }))?.school_id
    const msg = this.repo.create({
      student_id: studentId,
      school_id: sid,
      subject,
      message,
      status: 'pending',
    })
    return this.repo.save(msg)
  }

  findByStudentId(studentId: number) {
    return this.repo.find({
      where: { student_id: studentId },
      order: { created_at: 'DESC' },
    })
  }

  async findAllForSchool(schoolId?: number) {
    const where = schoolId != null ? { school_id: schoolId } : {}
    const messages = await this.repo.find({
      where,
      order: { created_at: 'DESC' },
    })

    const studentIds = [...new Set(messages.map((m) => m.student_id))]
    const students = studentIds.length
      ? await this.studentRepo.find({ where: { id: In(studentIds) }, select: ['id', 'name', 'class_id'] })
      : []

    const classIds = [...new Set(students.map((s) => s.class_id).filter(Boolean))] as number[]
    const classes = classIds.length
      ? await this.classRepo.find({ where: { id: In(classIds) }, select: ['id', 'name'] })
      : []

    const studentMap = new Map(students.map((s) => [s.id, s]))
    const classMap = new Map(classes.map((c) => [c.id, c]))

    return messages.map((m) => {
      const student = studentMap.get(m.student_id)
      const studentClass = student?.class_id ? classMap.get(student.class_id) : null
      return {
        id: m.id,
        student_id: m.student_id,
        student_name: student?.name ?? '-',
        class_name: studentClass?.name ?? '-',
        subject: m.subject,
        message: m.message,
        response: m.response,
        status: m.status,
        created_at: m.created_at,
        responded_at: m.responded_at,
      }
    })
  }

  async respond(id: number, response: string, schoolId?: number) {
    const msg = await this.repo.findOne({ where: { id } })
    if (!msg) throw new NotFoundException('Mensagem não encontrada')
    if (schoolId != null && msg.school_id !== schoolId) {
      throw new ForbiddenException('Acesso negado')
    }

    msg.response = response
    msg.status = 'responded'
    msg.responded_at = new Date().toISOString()
    return this.repo.save(msg)
  }
}
