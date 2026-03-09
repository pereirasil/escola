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
import { SubjectsModule } from './modules/subjects/subjects.module';
import { SchedulesModule } from './modules/schedules/schedules.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH ?? 'escola.db',
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
  ],
})
export class AppModule {}
