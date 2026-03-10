import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private repo: Repository<Schedule>,
  ) {}

  private async checkRoomConflict(dto: CreateScheduleDto | UpdateScheduleDto, excludeId?: number, schoolId?: number) {
    if (!dto.room || !dto.day_of_week || !dto.start_time || !dto.end_time) return;

    const query = this.repo.createQueryBuilder('s')
      .where('s.room = :room', { room: dto.room })
      .andWhere('s.day_of_week = :day', { day: dto.day_of_week })
      .andWhere('s.start_time < :end', { end: dto.end_time })
      .andWhere('s.end_time > :start', { start: dto.start_time });

    if (schoolId) {
      query.andWhere('s.school_id = :schoolId', { schoolId });
    }

    if (excludeId) {
      query.andWhere('s.id != :id', { id: excludeId });
    }

    const conflict = await query.getOne();
    if (conflict) {
      throw new ConflictException('Ja existe uma aula nesta sala, no mesmo dia e horario.');
    }
  }

  async create(createScheduleDto: CreateScheduleDto, schoolId?: number) {
    await this.checkRoomConflict(createScheduleDto, undefined, schoolId);
    return this.repo.save(this.repo.create({ ...createScheduleDto, school_id: schoolId }));
  }

  findAll(classId?: number, schoolId?: number) {
    const where: any = {};
    if (classId) where.class_id = classId;
    if (schoolId) where.school_id = schoolId;
    return this.repo.find({ where, order: { day_of_week: 'ASC', start_time: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto, schoolId?: number) {
    const existing = await this.findOne(id);
    const merged = { ...existing, ...updateScheduleDto };
    await this.checkRoomConflict(merged as CreateScheduleDto, id, schoolId);
    await this.repo.update(id, updateScheduleDto as Partial<Schedule>);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
