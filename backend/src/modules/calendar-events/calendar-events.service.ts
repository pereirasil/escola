import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CalendarEvent } from './entities/calendar-event.entity'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'
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
    if (!existing) throw new NotFoundException('Evento nao encontrado')

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
    if (!student) throw new NotFoundException('Aluno nao encontrado')

    let studentGrade: string | null = null
    if (student.class_id) {
      const cls = await this.classRepo.findOne({ where: { id: student.class_id } })
      if (cls) studentGrade = cls.grade
    }

    const where: any = {}
    if (student.school_id) where.school_id = student.school_id

    const events = await this.repo.find({ where, order: { date: 'ASC' } })

    if (!studentGrade) return []

    return events.filter((event) => {
      try {
        const series: string[] = JSON.parse(event.series)
        return series.includes(studentGrade!)
      } catch {
        return false
      }
    })
  }
}
