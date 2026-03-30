import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversation } from './entities/conversation.entity'
import { ConversationMessage } from './entities/conversation-message.entity'
import { ConversationRead } from './entities/conversation-read.entity'
import { Student } from '../students/entities/student.entity'
import { Teacher } from '../teachers/entities/teacher.entity'
import { ClassesModule } from '../classes/classes.module'
import { CommunicationService } from './communication.service'
import { CommunicationController } from './communication.controller'
import { ChatGateway } from './gateways/chat.gateway'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'chave-secreta-trocar-em-producao',
    }),
    TypeOrmModule.forFeature([Conversation, ConversationMessage, ConversationRead, Student, Teacher]),
    ClassesModule,
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService, ChatGateway],
  exports: [CommunicationService],
})
export class CommunicationModule {}
