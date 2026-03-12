import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { CalendarEvent } from './entities/calendar-event.entity'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'
import { Enrollment } from '../classes/entities/enrollment.entity'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class CalendarEventsService {
  constructor(
    @InjectRepository(CalendarEvent)
    private repo: Repository<CalendarEvent>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Class)
    private classRepo: Repository<Class>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    private notificationsService: NotificationsService,
  ) {}

  findAll(schoolId?: number) {
    const where = schoolId ? { school_id: schoolId } : {}
    return this.repo.find({ where, order: { date: 'ASC' } })
  }

  async create(dto: CreateCalendarEventDto, schoolId?: number) {
    const entity = this.repo.create({
      ...dto,
      series: JSON.stringify(dto.series),
      school_id: schoolId,
    })
    const saved = await this.repo.save(entity)
    await this.notificationsService.createForCalendarEvent(saved, dto.series, schoolId)
    return saved
  }

  async update(id: number, dto: UpdateCalendarEventDto) {
    const existing = await this.repo.findOne({ where: { id } })
    if (!existing) throw new NotFoundException('Evento não encontrado')

    const data: Partial<CalendarEvent> = { ...dto } as any
    if (dto.series) {
      data.series = JSON.stringify(dto.series)
    }
    await this.repo.update(id, data)
    return this.repo.findOne({ where: { id } })
  }

  async remove(id: number) {
    await this.repo.delete(id)
    return { success: true }
  }

  async findForStudent(studentId: number) {
    const student = await this.studentRepo.findOne({ where: { id: studentId } })
    if (!student) throw new NotFoundException('Aluno não encontrado')

    const enrollmentWhere: any = { student_id: studentId }
    if (student.school_id) enrollmentWhere.school_id = student.school_id
    const enrollments = await this.enrollmentRepo.find({ where: enrollmentWhere })

    const classIds = new Set<number>()
    if (student.class_id) classIds.add(student.class_id)
    for (const enrollment of enrollments) classIds.add(enrollment.class_id)

    const classes = classIds.size
      ? await this.classRepo.find({ where: { id: In(Array.from(classIds)) } })
      : []
    const studentGrades = new Set(classes.map((item) => item.grade).filter(Boolean))

    const where: any = {}
    if (student.school_id) where.school_id = student.school_id

    const events = await this.repo.find({ where, order: { date: 'ASC' } })

    if (studentGrades.size === 0) return []

    return events.filter((event) => {
      try {
        const series: string[] = JSON.parse(event.series)
        return series.some((item) => studentGrades.has(item))
      } catch {
        return false
      }
    })
  }
}
