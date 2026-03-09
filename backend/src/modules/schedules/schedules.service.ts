import { Injectable } from '@nestjs/common';
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

  create(createScheduleDto: CreateScheduleDto) {
    return this.repo.save(this.repo.create(createScheduleDto));
  }

  findAll(classId?: number) {
    const where = classId ? { class_id: classId } : {};
    return this.repo.find({ where, order: { day_of_week: 'ASC', start_time: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  update(id: number, updateScheduleDto: UpdateScheduleDto) {
    return this.repo.update(id, updateScheduleDto as Partial<Schedule>).then(() => this.findOne(id));
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
