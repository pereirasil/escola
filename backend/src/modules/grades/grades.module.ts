import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Grade } from './entities/grade.entity'
import { GradesService } from './grades.service'
import { GradesController } from './grades.controller'
import { Student } from '../students/entities/student.entity'
import { Enrollment } from '../classes/entities/enrollment.entity'
import { TeacherScopeModule } from '../../common/services/teacher-scope.module'

@Module({
  imports: [TypeOrmModule.forFeature([Grade, Student, Enrollment]), TeacherScopeModule],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
