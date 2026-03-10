import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Student } from './entities/student.entity'
import { StudentsService } from './students.service'
import { StudentsController } from './students.controller'
import { NotificationsModule } from '../notifications/notifications.module'
import { GradesModule } from '../grades/grades.module'
import { AttendanceModule } from '../attendance/attendance.module'
import { SubjectsModule } from '../subjects/subjects.module'

@Module({
  imports: [TypeOrmModule.forFeature([Student]), NotificationsModule, GradesModule, AttendanceModule, SubjectsModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
