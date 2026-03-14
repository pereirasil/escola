import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/useAuthStore'
import { alunosService } from '../../../services/alunos.service'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const gridItems = [
  { to: '/aluno/dados', label: 'Meus Dados', icon: 'dados' },
  { to: '/aluno/historico', label: 'Histórico', icon: 'historico' },
  { to: '/aluno/horarios', label: 'Horários', icon: 'horarios' },
  { to: '/aluno/notificacoes', label: 'Avisos', icon: 'aviso', badge: true },
  { to: '/aluno/datas', label: 'Datas Importantes', icon: 'calendario' },
  { to: '/aluno/reunioes', label: 'Reuniões', icon: 'reunioes' },
  { to: '/aluno/alterar-senha', label: 'Alterar Senha', icon: 'senha' },
]

const icons = {
  dados: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  historico: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  horarios: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  aviso: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  calendario: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  reunioes: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <rect x="3" y="11" width="18" height="8" rx="1" />
      <line x1="7" y1="15" x2="7.01" y2="15" />
      <line x1="11" y1="15" x2="13" y2="15" />
    </svg>
  ),
  senha: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
}

export default function AlunoDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const fileInputRef = useRef(null)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    alunosService.contarNotificacoesNaoLidas()
      .then((data) => setNotificationCount(data.count || 0))
      .catch(() => {})
  }, [])

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const updated = await alunosService.uploadMinhaFoto(file)
      useAuthStore.setState({ user: { ...user, photo: updated.photo } })
      toast.success('Foto atualizada.')
    } catch {
      toast.error('Erro ao atualizar foto.')
    }
  }

  return (
    <div className="aluno-dashboard">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoChange}
        style={{ display: 'none' }}
      />

      <section className="aluno-profile-card">
        <button type="button" className="aluno-profile-photo" onClick={handlePhotoClick}>
          {user?.photo ? (
            <img
              src={user.photo.startsWith('http') ? user.photo : `${API_URL}/uploads/${user.photo}`}
              alt={user.name}
            />
          ) : (
            <div className="aluno-profile-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>SEM FOTO</span>
            </div>
          )}
        </button>
        <div className="aluno-profile-info">
          <h2 className="aluno-profile-name">{user?.name || 'Aluno'}</h2>
        </div>
      </section>

      <section className="aluno-grid">
        {gridItems.map((item) => (
          <button
            key={item.to}
            type="button"
            className="aluno-grid-item"
            onClick={() => navigate(item.to)}
          >
            <span className="aluno-grid-icon-wrapper">
              {icons[item.icon] || icons.dados}
              {item.badge && notificationCount > 0 && (
                <span className="aluno-grid-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>
              )}
            </span>
            <span className="aluno-grid-label">{item.label}</span>
          </button>
        ))}
      </section>
    </div>
  )
}
