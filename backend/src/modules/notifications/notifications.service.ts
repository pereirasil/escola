import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, IsNull, Repository } from 'typeorm'
import { Notification } from './entities/notification.entity'
import { Student } from '../students/entities/student.entity'
import { Meeting } from '../meetings/entities/meeting.entity'
import { Class } from '../classes/entities/class.entity'
import { CalendarEvent } from '../calendar-events/entities/calendar-event.entity'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Class)
    private classRepo: Repository<Class>,
  ) {}

  findByStudentId(studentId: number) {
    return this.notificationRepo.find({
      where: { student_id: studentId },
      order: { created_at: 'DESC' },
    })
  }

  countUnread(studentId: number) {
    return this.notificationRepo.count({
      where: { student_id: studentId, read_at: IsNull() },
    })
  }

  async markAllAsRead(studentId: number) {
    await this.notificationRepo
      .createQueryBuilder()
      .update()
      .set({ read_at: new Date().toISOString() })
      .where('student_id = :studentId AND read_at IS NULL', { studentId })
      .execute()
  }

  async createForMeeting(meeting: Meeting, schoolId?: number) {
    if (!meeting.class_id) return
    const where: any = { class_id: meeting.class_id }
    if (schoolId) where.school_id = schoolId
    const students = await this.studentRepo.find({ where })

    const existing = await this.notificationRepo.find({
      where: { reference_id: meeting.id, type: 'meeting' },
      select: ['student_id'],
    })
    const existingIds = new Set(existing.map((n) => n.student_id))

    const notifications = students
      .filter((s) => !existingIds.has(s.id))
      .map((s) =>
        this.notificationRepo.create({
          student_id: s.id,
          title: meeting.title,
          message: meeting.description ?? `Reunião agendada para ${meeting.scheduled_at ?? 'data a definir'}.`,
          type: 'meeting',
          reference_id: meeting.id,
          school_id: schoolId,
        }),
      )
    if (notifications.length) {
      await this.notificationRepo.save(notifications)
    }
  }

  async createForCalendarEvent(event: CalendarEvent, series: string[], schoolId?: number) {
    const where: any = {}
    if (schoolId) where.school_id = schoolId
    if (series.length > 0) where.grade = In(series)

    const classes = await this.classRepo.find({ where, select: ['id'] })
    if (classes.length === 0) return

    const classIds = classes.map((c) => c.id)
    const students = await this.studentRepo.find({
      where: { class_id: In(classIds), ...(schoolId ? { school_id: schoolId } : {}) },
    })
    if (students.length === 0) return

    const existing = await this.notificationRepo.find({
      where: { reference_id: event.id, type: 'calendar_event' },
      select: ['student_id'],
    })
    const existingIds = new Set(existing.map((n) => n.student_id))

    const date = event.date || ''
    const formattedDate = date.includes('-')
      ? date.split('-').reverse().join('/')
      : date

    const notifications = students
      .filter((s) => !existingIds.has(s.id))
      .map((s) =>
        this.notificationRepo.create({
          student_id: s.id,
          title: event.title,
          message: event.description || `Data comemorativa: ${event.title} em ${formattedDate}.`,
          type: 'calendar_event',
          reference_id: event.id,
          school_id: schoolId,
        }),
      )
    if (notifications.length) {
      await this.notificationRepo.save(notifications)
    }
  }
}
