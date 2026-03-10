import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { alunosService } from '../../services/alunos.service'

export function NotificationBell() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  const fetchCount = () => {
    alunosService.contarNotificacoesNaoLidas()
      .then((data) => setCount(data.count || 0))
      .catch(() => {})
  }

  useEffect(() => {
    fetchCount()
    intervalRef.current = setInterval(fetchCount, 30000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const handleClick = () => {
    if (count > 0) {
      alunosService.marcarNotificacoesComoLidas()
        .then(() => setCount(0))
        .catch(() => {})
    }
    navigate('/aluno/notificacoes')
  }

  return (
    <button
      type="button"
      className="notification-bell"
      onClick={handleClick}
      aria-label={`Notificacoes${count > 0 ? `, ${count} nao lidas` : ''}`}
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
  )
}
