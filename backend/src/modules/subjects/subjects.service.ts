import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './entities/subject.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private repo: Repository<Subject>,
  ) {}

  create(createSubjectDto: CreateSubjectDto) {
    return this.repo.save(this.repo.create(createSubjectDto));
  }

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  update(id: number, updateSubjectDto: UpdateSubjectDto) {
    return this.repo.update(id, updateSubjectDto as Partial<Subject>).then(() => this.findOne(id));
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
