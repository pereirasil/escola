import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Grade } from './entities/grade.entity'
import { GradesService } from './grades.service'
import { GradesController } from './grades.controller'
import { Student } from '../students/entities/student.entity'
import { ClassesModule } from '../classes/classes.module'

@Module({
  imports: [TypeOrmModule.forFeature([Grade, Student]), ClassesModule],
  controllers: [GradesController],
  providers: [GradesService],
})
export class GradesModule {}
