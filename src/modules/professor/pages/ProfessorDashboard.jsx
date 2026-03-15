import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/useAuthStore'
import { professoresService } from '../../../services/professores.service'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const gridItems = [
  { to: '/professor/turmas', label: 'Minhas Turmas', icon: 'turmas' },
  { to: '/professor/notas', label: 'Lançar Notas', icon: 'notas' },
  { to: '/professor/faltas', label: 'Chamada', icon: 'faltas' },
  { to: '/professor/comunicacao', label: 'Comunicação', icon: 'aviso' },
  { to: '/professor/historico', label: 'Histórico', icon: 'historico' },
  { to: '/professor/alterar-senha', label: 'Alterar Senha', icon: 'senha' },
]

const icons = {
  turmas: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-4-4h-2.5" />
      <path d="M16 11a4 4 0 0 1 4 4v2" />
    </svg>
  ),
  notas: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  faltas: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  historico: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  senha: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
}

export default function ProfessorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const fileInputRef = useRef(null)

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const updated = await professoresService.uploadMinhaFoto(file)
      useAuthStore.setState({ user: { ...user, photo: updated.photo } })
      toast.success('Foto atualizada.')
    } catch {
      toast.error('Erro ao atualizar foto.')
    }
  }

  return (
    <div className="aluno-dashboard professor-dashboard">
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
          <h2 className="aluno-profile-name">{user?.name || 'Professor'}</h2>
          <span className="aluno-profile-role">Professor</span>
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
              {icons[item.icon] || icons.turmas}
            </span>
            <span className="aluno-grid-label">{item.label}</span>
          </button>
        ))}
      </section>
    </div>
  )
}
