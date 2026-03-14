import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversation } from './entities/conversation.entity'
import { ConversationMessage } from './entities/conversation-message.entity'
import { Student } from '../students/entities/student.entity'
import { CommunicationService } from './communication.service'
import { CommunicationController } from './communication.controller'
import { ChatGateway } from './gateways/chat.gateway'

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ConversationMessage, Student]),
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService, ChatGateway],
  exports: [CommunicationService],
})
export class CommunicationModule {}
