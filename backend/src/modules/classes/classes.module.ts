import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Class } from './entities/class.entity'
import { Enrollment } from './entities/enrollment.entity'
import { Student } from '../students/entities/student.entity'
import { Schedule } from '../schedules/entities/schedule.entity'
import { Teacher } from '../teachers/entities/teacher.entity'
import { ClassesService } from './classes.service'
import { ClassesController } from './classes.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, Enrollment, Student, Schedule, Teacher]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
