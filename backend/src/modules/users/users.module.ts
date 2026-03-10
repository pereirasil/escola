import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Student } from '../students/entities/student.entity'
import { Teacher } from '../teachers/entities/teacher.entity'
import { Class } from '../classes/entities/class.entity'
import { Subject } from '../subjects/entities/subject.entity'
import { Grade } from '../grades/entities/grade.entity'
import { Attendance } from '../attendance/entities/attendance.entity'
import { Meeting } from '../meetings/entities/meeting.entity'
import { Payment } from '../payments/entities/payment.entity'
import { Schedule } from '../schedules/entities/schedule.entity'
import { Notification } from '../notifications/entities/notification.entity'
import { Enrollment } from '../classes/entities/enrollment.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Student, Teacher, Class, Subject, Grade,
      Attendance, Meeting, Payment, Schedule, Notification, Enrollment,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
