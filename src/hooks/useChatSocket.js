import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/useAuthStore'
import { communicationService } from '../services/communication.service'

export function useChatSocket(conversationId, onNewMessage, onConversationClosed) {
  const socketRef = useRef(null)
  const token = useAuthStore((s) => s.token)

  const connect = useCallback(() => {
    if (!token) return
    const serverUrl = communicationService.getSocketUrl()
    const chatUrl = `${serverUrl}/chat`
    const s = io(chatUrl, {
      path: communicationService.getSocketPath(),
      auth: { token },
      transports: ['websocket', 'polling'],
    })
    socketRef.current = s
    return s
  }, [token])

  useEffect(() => {
    if (!conversationId || !token) return
    const s = socketRef.current || connect()
    if (!s.connected) {
      s.connect()
    }
    s.emit('join_conversation', { conversationId })
    const onMsg = (payload) => onNewMessage && onNewMessage(payload.message)
    const onClosed = (payload) => onConversationClosed && onConversationClosed(payload.conversationId)
    s.on('new_message', onMsg)
    s.on('conversation_closed', onClosed)
    return () => {
      s.off('new_message', onMsg)
      s.off('conversation_closed', onClosed)
      s.emit('leave_conversation', { conversationId })
    }
  }, [conversationId, token, connect, onNewMessage, onConversationClosed])

  const sendMessage = useCallback((message, senderType, senderId) => {
    const s = socketRef.current
    if (!s || !conversationId) return
    s.emit('send_message', {
      conversationId,
      message,
      senderType,
      senderId,
    })
  }, [conversationId])

  return { sendMessage, socket: socketRef.current }
}
