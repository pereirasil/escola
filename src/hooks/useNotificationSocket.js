import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { communicationService } from '../services/communication.service'
import { useAuthStore } from '../store/useAuthStore'

/**
 * Conecta ao socket e entra na sala de notificações para receber
 * unread_count_changed em tempo real. Reduz dependência de polling.
 */
export function useNotificationSocket() {
  const socketRef = useRef(null)
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!token || !user?.role) return

    const serverUrl = communicationService.getSocketUrl()
    const chatUrl = `${serverUrl}/chat`
    const s = io(chatUrl, {
      path: communicationService.getSocketPath(),
      auth: { token },
      transports: ['websocket', 'polling'],
    })
    socketRef.current = s

    const role = user.role
    const payload =
      role === 'responsible' && user.student_id
        ? { role: 'student', studentId: user.student_id }
        : role === 'school'
          ? { role: 'school', schoolId: user.school_id ?? user.id }
          : role === 'teacher'
            ? { role: 'teacher', teacherId: user.id }
            : null

    if (payload) {
      s.once('connect', () => s.emit('join_notifications', payload))
      if (s.connected) s.emit('join_notifications', payload)
    }

    const onUnreadChanged = () => {
      window.dispatchEvent(new CustomEvent('communication:unread-changed'))
    }
    s.on('unread_count_changed', onUnreadChanged)

    return () => {
      s.off('unread_count_changed', onUnreadChanged)
      s.disconnect()
      socketRef.current = null
    }
  }, [token, user?.role, user?.id, user?.student_id, user?.school_id])
}
