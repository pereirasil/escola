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

  findAll() {
    return this.repo.find({ order: { scheduled_at: 'DESC' } })
  }

  async create(dto: CreateMeetingDto) {
    const meeting = await this.repo.save(this.repo.create(dto))
    await this.notificationsService.createForMeeting(meeting)
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
