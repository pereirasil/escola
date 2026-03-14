import { Module } from '@nestjs/common'
import { StudentMessagesModule } from '../student-messages/student-messages.module'
import { SchoolController } from './school.controller'

@Module({
  imports: [StudentMessagesModule],
  controllers: [SchoolController],
})
export class SchoolModule {}
