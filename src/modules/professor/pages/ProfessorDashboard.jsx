import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/useAuthStore'

const gridItems = [
  { to: '/professor/turmas', label: 'Minhas Turmas', icon: 'turmas' },
  { to: '/professor/notas', label: 'Lançar Notas', icon: 'notas' },
  { to: '/professor/faltas', label: 'Chamada', icon: 'faltas' },
  { to: '/professor/historico-notas', label: 'Histórico de Notas', icon: 'historico' },
  { to: '/professor/historico-presenca', label: 'Histórico de Presença', icon: 'historico' },
  { to: '/professor/historico', label: 'Resumo frequência', icon: 'historico' },
  { to: '/professor/comunicacao', label: 'Comunicação', icon: 'aviso' },
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
  aviso: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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

  return (
    <div className="aluno-dashboard professor-dashboard">
      <section className="aluno-profile-card">
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
