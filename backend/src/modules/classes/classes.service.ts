import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Class } from './entities/class.entity'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private repo: Repository<Class>,
  ) {}

  findAll(schoolId?: number) {
    const where = schoolId ? { school_id: schoolId } : {}
    return this.repo.find({ where, order: { name: 'ASC' } })
  }

  findByTeacherId(teacherId: number, schoolId?: number) {
    const qb = this.repo.createQueryBuilder('c')
      .where(
        '(c.teacher_id = :tid OR c.id IN ' +
        '(SELECT s.class_id FROM schedules s WHERE s.teacher_id = :tid))',
        { tid: teacherId },
      )
    if (schoolId) qb.andWhere('c.school_id = :sid', { sid: schoolId })
    return qb.orderBy('c.name', 'ASC').getMany()
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } })
  }

  create(dto: CreateClassDto, schoolId?: number) {
    return this.repo.save(this.repo.create({ ...dto, school_id: schoolId }))
  }

  update(id: number, dto: UpdateClassDto) {
    return this.repo.update(id, dto as Partial<Class>).then(() => this.findOne(id))
  }

  remove(id: number) {
    return this.repo.delete(id)
  }
}
