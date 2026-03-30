import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Teacher } from './entities/teacher.entity'
import { User } from '../users/entities/user.entity'
import { TeachersService } from './teachers.service'
import { TeachersController } from './teachers.controller'
import { ClassesModule } from '../classes/classes.module'
import { SchedulesModule } from '../schedules/schedules.module'
import { SubjectsModule } from '../subjects/subjects.module'
import { TeacherScopeModule } from '../../common/services/teacher-scope.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, User]),
    ClassesModule,
    SchedulesModule,
    SubjectsModule,
    TeacherScopeModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
