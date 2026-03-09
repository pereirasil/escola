import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Attendance } from './entities/attendance.entity'
import { AttendanceService } from './attendance.service'
import { AttendanceController } from './attendance.controller'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'
import { ClassesModule } from '../classes/classes.module'

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Student, Class]), ClassesModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}

