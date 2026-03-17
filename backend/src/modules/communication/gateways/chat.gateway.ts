import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { CommunicationService } from '../communication.service'
import { Conversation } from '../entities/conversation.entity'

@WebSocketGateway({
  cors: { origin: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private communicationService: CommunicationService) {}

  async handleConnection() {
    // Auth via handshake.auth.token optional; validate in join_conversation/send_message
  }

  handleDisconnect() {}

  @SubscribeMessage('join_notifications')
  async handleJoinNotifications(
    @MessageBody() payload: { role: string; studentId?: number; schoolId?: number; teacherId?: number },
    @ConnectedSocket() client: any,
  ) {
    const { role } = payload
    if (role === 'student' && payload.studentId) {
      await client.join(`notifications:student:${payload.studentId}`)
    } else if (role === 'school' && payload.schoolId) {
      await client.join(`notifications:school:${payload.schoolId}`)
    } else if (role === 'teacher' && payload.teacherId) {
      await client.join(`notifications:teacher:${payload.teacherId}`)
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() payload: { conversationId: number; token?: string },
    @ConnectedSocket() client: any,
  ) {
    const { conversationId } = payload
    if (!conversationId) return
    const room = `conversation:${conversationId}`
    await client.join(room)
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody()
    payload: {
      conversationId: number
      message: string
      senderType: string
      senderId: number
      token?: string
    },
    @ConnectedSocket() client: any,
  ) {
    const { conversationId, message, senderType, senderId } = payload
    if (!conversationId || !message?.trim() || !senderType || !senderId) return

    try {
      const { message: savedMsg } = await this.communicationService.addMessage(
        conversationId,
        senderType,
        senderId,
        message.trim(),
        undefined,
      )
      const room = `conversation:${conversationId}`
      this.server.to(room).emit('new_message', {
        conversationId,
        message: savedMsg,
      })
    } catch {
      client.emit('error', { message: 'Erro ao enviar mensagem' })
    }
  }

  emitConversationClosed(conversationId: number) {
    const room = `conversation:${conversationId}`
    this.server.to(room).emit('conversation_closed', { conversationId })
  }

  emitNewMessage(conversationId: number, message: any) {
    const room = `conversation:${conversationId}`
    this.server.to(room).emit('new_message', { conversationId, message })
  }

  emitUnreadCountUpdate(conv: Conversation, senderType: string) {
    if (senderType === 'student') {
      if (conv.teacher_id) {
        this.server.to(`notifications:teacher:${conv.teacher_id}`).emit('unread_count_changed')
      } else if (conv.school_id) {
        this.server.to(`notifications:school:${conv.school_id}`).emit('unread_count_changed')
      }
    } else if (senderType === 'school' || senderType === 'teacher') {
      if (conv.student_id) {
        this.server.to(`notifications:student:${conv.student_id}`).emit('unread_count_changed')
      }
    }
  }
}
