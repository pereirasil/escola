import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Student } from './entities/student.entity'
import { StudentsService } from './students.service'
import { StudentsController } from './students.controller'
import { NotificationsModule } from '../notifications/notifications.module'
import { GradesModule } from '../grades/grades.module'
import { AttendanceModule } from '../attendance/attendance.module'
import { SubjectsModule } from '../subjects/subjects.module'
import { TeacherScopeModule } from '../../common/services/teacher-scope.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    NotificationsModule,
    forwardRef(() => GradesModule),
    forwardRef(() => AttendanceModule),
    SubjectsModule,
    TeacherScopeModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
