import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Meeting } from './entities/meeting.entity'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private repo: Repository<Meeting>,
    private notificationsService: NotificationsService,
  ) {}

  findAll(schoolId?: number) {
    const where = schoolId ? { school_id: schoolId } : {}
    return this.repo.find({ where, order: { scheduled_at: 'DESC' } })
  }

  async create(dto: CreateMeetingDto, schoolId?: number) {
    const meeting = await this.repo.save(this.repo.create({ ...dto, school_id: schoolId }))
    await this.notificationsService.createForMeeting(meeting, schoolId)
    return meeting
  }

  async update(id: number, dto: Partial<CreateMeetingDto>) {
    await this.repo.update(id, dto)
    return this.repo.findOne({ where: { id } })
  }

  async remove(id: number) {
    await this.repo.delete(id)
    return { success: true }
  }
}
