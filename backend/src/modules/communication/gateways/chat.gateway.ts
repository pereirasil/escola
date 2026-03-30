import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { CommunicationService } from '../communication.service'
import { Conversation } from '../entities/conversation.entity'

type JwtClaims = {
  sub: number
  role: string
  school_id?: number
  student_id?: number
  document?: string
}

@WebSocketGateway({
  cors: { origin: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private communicationService: CommunicationService,
    private jwtService: JwtService,
  ) {}

  private verifyClient(client: Socket): JwtClaims | null {
    const token = client.handshake?.auth?.token
    if (!token || typeof token !== 'string') return null
    try {
      return this.jwtService.verify<JwtClaims>(token)
    } catch {
      return null
    }
  }

  async handleConnection() {
    // Autenticação validada nos handlers (token no handshake.auth).
  }

  handleDisconnect() {}

  @SubscribeMessage('join_notifications')
  async handleJoinNotifications(
    @MessageBody() payload: { role: string; studentId?: number; schoolId?: number; teacherId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const jwt = this.verifyClient(client)
    if (!jwt) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Token inválido ou ausente' })
      return
    }
    const { role } = payload
    if (role === 'student' && jwt.role === 'responsible' && jwt.student_id != null) {
      if (payload.studentId !== jwt.student_id) {
        client.emit('error', { code: 'FORBIDDEN', message: 'Sala de notificação não autorizada' })
        return
      }
      await client.join(`notifications:student:${jwt.student_id}`)
      return
    }
    if (role === 'school' && jwt.role === 'school' && jwt.school_id != null) {
      const sid = payload.schoolId ?? jwt.school_id
      if (sid !== jwt.school_id) {
        client.emit('error', { code: 'FORBIDDEN', message: 'Sala de notificação não autorizada' })
        return
      }
      await client.join(`notifications:school:${jwt.school_id}`)
      return
    }
    if (role === 'teacher' && jwt.role === 'teacher') {
      if (payload.teacherId !== jwt.sub) {
        client.emit('error', { code: 'FORBIDDEN', message: 'Sala de notificação não autorizada' })
        return
      }
      await client.join(`notifications:teacher:${jwt.sub}`)
      return
    }
    client.emit('error', { code: 'FORBIDDEN', message: 'Perfil não suportado para notificações' })
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() payload: { conversationId: number; token?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const jwt = this.verifyClient(client)
    if (!jwt) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Token inválido ou ausente' })
      return
    }
    const { conversationId } = payload
    if (!conversationId) return
    try {
      if (jwt.role === 'responsible') {
        await this.communicationService.ensureConversationAccess(
          conversationId,
          jwt.student_id ?? undefined,
          undefined,
        )
      } else if (jwt.role === 'school') {
        await this.communicationService.ensureConversationAccess(
          conversationId,
          undefined,
          jwt.school_id ?? undefined,
        )
      } else if (jwt.role === 'teacher') {
        await this.communicationService.ensureTeacherConversationAccess(conversationId, jwt.sub)
      } else {
        client.emit('error', { code: 'FORBIDDEN', message: 'Acesso negado à conversa' })
        return
      }
    } catch {
      client.emit('error', { code: 'FORBIDDEN', message: 'Acesso negado à conversa' })
      return
    }
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
    @ConnectedSocket() client: Socket,
  ) {
    const jwt = this.verifyClient(client)
    if (!jwt) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Token inválido ou ausente' })
      return
    }
    const { conversationId, message, senderType, senderId } = payload
    if (!conversationId || !message?.trim() || !senderType || senderId == null) return

    const ok =
      (senderType === 'student' &&
        jwt.role === 'responsible' &&
        jwt.student_id != null &&
        senderId === jwt.student_id) ||
      (senderType === 'school' && jwt.role === 'school' && senderId === jwt.sub) ||
      (senderType === 'teacher' && jwt.role === 'teacher' && senderId === jwt.sub)

    if (!ok) {
      client.emit('error', { code: 'FORBIDDEN', message: 'Remetente não confere com a sessão' })
      return
    }

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

  emitNewMessage(conversationId: number, message: unknown) {
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
