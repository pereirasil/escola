import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { alunosService } from '../../services/alunos.service'
import { communicationService } from '../../services/communication.service'
import { useAuthStore } from '../../store/useAuthStore'
import { useNotificationSocket } from '../../hooks/useNotificationSocket'

function formatItemDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return ''
  }
}

export function NotificationBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const intervalRef = useRef(null)
  const wrapperRef = useRef(null)
  const { user } = useAuthStore()

  useNotificationSocket()

  const fetchCount = useCallback(() => {
    const role = user?.role
    if (role === 'responsible') {
      Promise.all([
        alunosService.contarNotificacoesNaoLidas(),
        communicationService.contarNaoLidasAluno(),
      ])
        .then(([notif, comm]) => setCount((notif?.count || 0) + (comm?.count || 0)))
        .catch(() => {})
    } else if (role === 'school') {
      communicationService
        .contarNaoLidasEscola()
        .then((data) => setCount(data?.count || 0))
        .catch(() => {})
    } else if (role === 'teacher') {
      communicationService
        .contarNaoLidasProfessor()
        .then((data) => setCount(data?.count || 0))
        .catch(() => {})
    }
  }, [user?.role])

  const loadInbox = useCallback(() => {
    const role = user?.role
    if (role === 'responsible') {
      return alunosService
        .meuInbox()
        .then((data) => (Array.isArray(data?.items) ? data.items : []))
        .catch(() => [])
    }
    if (role === 'school') {
      return communicationService
        .inboxEscola()
        .then((data) => (Array.isArray(data?.items) ? data.items : []))
        .catch(() => [])
    }
    if (role === 'teacher') {
      return communicationService
        .inboxProfessor()
        .then((data) => (Array.isArray(data?.items) ? data.items : []))
        .catch(() => [])
    }
    return Promise.resolve([])
  }, [user?.role])

  useEffect(() => {
    if (!user?.role) return
    fetchCount()
    intervalRef.current = setInterval(fetchCount, 60000)
    const onConversationRead = () => fetchCount()
    const onUnreadChanged = () => fetchCount()
    window.addEventListener('communication:conversation-read', onConversationRead)
    window.addEventListener('communication:unread-changed', onUnreadChanged)
    return () => {
      clearInterval(intervalRef.current)
      window.removeEventListener('communication:conversation-read', onConversationRead)
      window.removeEventListener('communication:unread-changed', onUnreadChanged)
    }
  }, [user?.role, user?.id, fetchCount])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleBellClick = async () => {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    setLoading(true)
    const list = await loadInbox()
    setItems(list)
    setLoading(false)
  }

  const handleItemClick = async (item) => {
    const role = user?.role
    setOpen(false)

    if (role === 'responsible') {
      if (item.kind === 'notice' && item.notification_id != null) {
        try {
          await alunosService.marcarNotificacaoComoLida(item.notification_id)
          fetchCount()
          window.dispatchEvent(new CustomEvent('notifications:feed-changed'))
        } catch {
          /* mantém navegação mesmo se o PATCH falhar */
        }
        navigate('/aluno/comunicacao?tab=aviso')
        return
      }
      if (item.kind === 'message' && item.conversation_id != null) {
        const tab = item.channel === 'teacher' ? 'professor' : 'secretaria'
        navigate(`/aluno/comunicacao?tab=${tab}&conversation=${item.conversation_id}`)
        return
      }
    }

    if (role === 'school' && item.conversation_id != null) {
      navigate(`/comunicacao?conversation=${item.conversation_id}`)
      return
    }

    if (role === 'teacher' && item.conversation_id != null) {
      navigate(`/professor/comunicacao?conversation=${item.conversation_id}`)
    }
  }

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="notification-bell"
        onClick={handleBellClick}
        aria-label={`Notificações${count > 0 ? `, ${count} não lidas` : ''}`}
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="notification-badge">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">Notificações</div>
          <div className="notification-dropdown-body notification-dropdown-body--scroll">
            {loading ? (
              <div className="notification-dropdown-empty">Carregando...</div>
            ) : items.length === 0 ? (
              <div className="notification-dropdown-empty notification-dropdown-empty--solo">
                Nenhuma notificação
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.source_id || `${item.kind}-${item.notification_id}-${item.conversation_id}`}
                  type="button"
                  className="notification-dropdown-item"
                  onClick={() => handleItemClick(item)}
                >
                  {item.type_label && (
                    <span className="notification-dropdown-type">{item.type_label}</span>
                  )}
                  <strong>{item.title}</strong>
                  {item.subtitle && <p>{item.subtitle}</p>}
                  {item.at && (
                    <small>{formatItemDate(item.at)}</small>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
