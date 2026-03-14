import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StudentMessage } from './entities/student-message.entity'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'
import { StudentMessagesService } from './student-messages.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentMessage, Student, Class]),
  ],
  providers: [StudentMessagesService],
  exports: [StudentMessagesService],
})
export class StudentMessagesModule {}
