import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Responsible } from './entities/responsible.entity'
import { ResponsibleStudent } from './entities/responsible-student.entity'
import { Student } from '../students/entities/student.entity'
import { ResponsiblesService } from './responsibles.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Responsible, ResponsibleStudent, Student]),
  ],
  providers: [ResponsiblesService],
  exports: [ResponsiblesService],
})
export class ResponsiblesModule {}
