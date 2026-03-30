import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Student } from './entities/student.entity'
import { User } from '../users/entities/user.entity'
import { StudentsService } from './students.service'
import { StudentsController } from './students.controller'
import { AlunosController } from './alunos.controller'
import { BoletimPdfService } from './services/boletim-pdf.service'
import { PresencaHistoricoPdfService } from './services/presenca-historico-pdf.service'
import { NotificationsModule } from '../notifications/notifications.module'
import { GradesModule } from '../grades/grades.module'
import { AttendanceModule } from '../attendance/attendance.module'
import { SubjectsModule } from '../subjects/subjects.module'
import { TeacherScopeModule } from '../../common/services/teacher-scope.module'
import { SchedulesModule } from '../schedules/schedules.module'
import { ClassesModule } from '../classes/classes.module'
import { TeachersModule } from '../teachers/teachers.module'
import { CalendarEventsModule } from '../calendar-events/calendar-events.module'
import { MeetingsModule } from '../meetings/meetings.module'
import { StudentMessagesModule } from '../student-messages/student-messages.module'
import { ResponsiblesModule } from '../responsibles/responsibles.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, User]),
    ResponsiblesModule,
    StudentMessagesModule,
    NotificationsModule,
    forwardRef(() => GradesModule),
    forwardRef(() => AttendanceModule),
    SubjectsModule,
    TeacherScopeModule,
    SchedulesModule,
    forwardRef(() => ClassesModule),
    TeachersModule,
    CalendarEventsModule,
    MeetingsModule,
  ],
  controllers: [StudentsController, AlunosController],
  providers: [StudentsService, BoletimPdfService, PresencaHistoricoPdfService],
  exports: [StudentsService],
})
export class StudentsModule {}
