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

  async findByClassIdsOrGeneral(classIds: number[], schoolId?: number): Promise<Meeting[]> {
    const qb = this.repo
      .createQueryBuilder('m')
      .orderBy('m.scheduled_at', 'DESC')

    qb.andWhere('(m.class_id IS NULL OR m.class_id IN (:...classIds))', { classIds: classIds.length ? classIds : [0] })

    if (schoolId !== undefined && schoolId !== null) {
      qb.andWhere('(m.school_id = :schoolId OR m.school_id IS NULL)', { schoolId })
    }

    return qb.getMany()
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
