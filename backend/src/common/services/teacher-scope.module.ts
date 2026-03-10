import { Module, forwardRef } from '@nestjs/common'
import { TeacherScopeService } from './teacher-scope.service'
import { ClassesModule } from '../../modules/classes/classes.module'
import { StudentsModule } from '../../modules/students/students.module'
import { SchedulesModule } from '../../modules/schedules/schedules.module'

@Module({
  imports: [ClassesModule, forwardRef(() => StudentsModule), SchedulesModule],
  providers: [TeacherScopeService],
  exports: [TeacherScopeService],
})
export class TeacherScopeModule {}
