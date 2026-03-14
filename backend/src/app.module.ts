import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { StudentsModule } from './modules/students/students.module'
import { TeachersModule } from './modules/teachers/teachers.module'
import { ClassesModule } from './modules/classes/classes.module'
import { GradesModule } from './modules/grades/grades.module'
import { AttendanceModule } from './modules/attendance/attendance.module'
import { MeetingsModule } from './modules/meetings/meetings.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { SubjectsModule } from './modules/subjects/subjects.module'
import { SchedulesModule } from './modules/schedules/schedules.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { CalendarEventsModule } from './modules/calendar-events/calendar-events.module'
import { StudentMessagesModule } from './modules/student-messages/student-messages.module'
import { SchoolModule } from './modules/school/school.module'
import { CommunicationModule } from './modules/communication/communication.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    GradesModule,
    AttendanceModule,
    MeetingsModule,
    PaymentsModule,
    SubjectsModule,
    SchedulesModule,
    NotificationsModule,
    CalendarEventsModule,
    StudentMessagesModule,
    SchoolModule,
    CommunicationModule,
  ],
})
export class AppModule {}
