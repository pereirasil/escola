import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { alunosService } from '../../services/alunos.service'
import { communicationService } from '../../services/communication.service'
import { useAuthStore } from '../../store/useAuthStore'
import { useNotificationSocket } from '../../hooks/useNotificationSocket'

export function NotificationBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const intervalRef = useRef(null)
  const wrapperRef = useRef(null)
  const { user } = useAuthStore()

  useNotificationSocket()

  const fetchCount = () => {
    const role = user?.role
    if (role === 'responsible') {
      Promise.all([
        alunosService.contarNotificacoesNaoLidas(),
        communicationService.contarNaoLidasAluno(),
      ])
        .then(([notif, comm]) => setCount((notif?.count || 0) + (comm?.count || 0)))
        .catch(() => {})
    } else if (role === 'school') {
      communicationService.contarNaoLidasEscola()
        .then((data) => setCount(data?.count || 0))
        .catch(() => {})
    } else if (role === 'teacher') {
      communicationService.contarNaoLidasProfessor()
        .then((data) => setCount(data?.count || 0))
        .catch(() => {})
    }
  }

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
  }, [user?.role, user?.id])

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
    const role = user?.role
    if (role === 'responsible') {
      alunosService.minhasNotificacoes()
        .then((data) => setLista(data || []))
        .catch(() => setLista([]))
        .finally(() => setLoading(false))
      if (count > 0) {
        try {
          await alunosService.marcarNotificacoesComoLidas()
          fetchCount()
        } catch {}
      }
    } else {
      setLista([])
      setLoading(false)
    }
  }

  const getComunicacaoPath = () => {
    const role = user?.role
    if (role === 'school') return '/comunicacao'
    if (role === 'teacher') return '/professor/comunicacao'
    return '/aluno/comunicacao'
  }

  const handleNotificacaoClick = () => {
    setOpen(false)
    navigate(getComunicacaoPath())
  }

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="notification-bell"
        onClick={handleBellClick}
        aria-label={`Comunicação${count > 0 ? `, ${count} não lidas` : ''}`}
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
          <div className="notification-dropdown-header">Comunicação</div>
          <div className="notification-dropdown-body">
            {user?.role !== 'student' ? (
              <div className="notification-dropdown-empty">
                {count > 0 ? `${count} mensagem(ns) não lida(s).` : 'Nenhuma mensagem nova.'}
                <br />
                <button type="button" className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={handleNotificacaoClick}>
                  Ver Comunicação
                </button>
              </div>
            ) : loading ? (
              <div className="notification-dropdown-empty">Carregando...</div>
            ) : lista.length === 0 ? (
              <div className="notification-dropdown-empty">Nenhum aviso.</div>
            ) : (
              lista.map((n) => (
                <div
                  key={n.id}
                  className="notification-dropdown-item"
                  onClick={handleNotificacaoClick}
                >
                  <strong>{n.title}</strong>
                  {n.message && <p>{n.message}</p>}
                  <small>{new Date(n.created_at).toLocaleString('pt-BR')}</small>
                </div>
              ))
            )}
          </div>
          {(lista.length > 0 || (user?.role !== 'student' && count > 0)) && (
            <div className="notification-dropdown-footer">
              <button type="button" onClick={handleNotificacaoClick}>Ver todas</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
