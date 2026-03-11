import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Attendance } from './entities/attendance.entity'
import { AttendanceService } from './attendance.service'
import { AttendanceController } from './attendance.controller'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'
import { Enrollment } from '../classes/entities/enrollment.entity'
import { TeacherScopeModule } from '../../common/services/teacher-scope.module'

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Student, Class, Enrollment]), TeacherScopeModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
