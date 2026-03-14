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
}
