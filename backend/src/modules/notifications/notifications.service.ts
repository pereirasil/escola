import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { Notification } from './entities/notification.entity'
import { Student } from '../students/entities/student.entity'
import { Meeting } from '../meetings/entities/meeting.entity'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
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
}
