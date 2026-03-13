import { useState, useRef } from 'react'
import { Outlet, useNavigate, NavLink, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { professoresService } from '../services/professores.service'
import BottomNav from '../components/BottomNav'
import NoIndex from '../components/NoIndex'
import toast from 'react-hot-toast'

const professorBottomNavItems = [
  { key: 'turmas', to: '/professor/turmas', label: 'Turmas', icon: 'turmas', end: false },
  { key: 'faltas', to: '/professor/faltas', label: 'Faltas', icon: 'faltas', end: false },
  { key: 'notas', to: '/professor/notas', label: 'Notas', icon: 'notas', end: false },
  { key: 'historico', to: '/professor/historico', label: 'Histórico', icon: 'historico', end: false },
  { key: 'menu', type: 'button', label: 'Mais', icon: 'menu' },
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function ProfessorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  if (user?.role !== 'teacher') {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

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

  const linkClass = ({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')
  const handleLinkClick = () => setSidebarOpen(false)

  return (
    <div className="layout">
      <NoIndex />
      {sidebarOpen && <div className="sidebar-overlay sidebar-overlay-visible" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink to="/professor/turmas" className={linkClass} onClick={handleLinkClick}>Minhas Turmas</NavLink>
          <NavLink to="/professor/faltas" className={linkClass} onClick={handleLinkClick}>Lançamento de Faltas</NavLink>
          <NavLink to="/professor/notas" className={linkClass} onClick={handleLinkClick}>Lançamento de Notas</NavLink>
          <NavLink to="/professor/historico" className={linkClass} onClick={handleLinkClick}>Histórico e Gráficos</NavLink>
          <NavLink to="/professor/alterar-senha" className={linkClass} onClick={handleLinkClick}>Alterar Senha</NavLink>
        </nav>
      </aside>
      <div className="layout-main">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button type="button" className="sidebar-toggle" onClick={() => setSidebarOpen(prev => !prev)} aria-label="Menu">
              &#9776;
            </button>
            <h1 className="header-title">Área do Professor</h1>
          </div>
          <div className="header-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            {user?.photo ? (
              <img
                src={user.photo.startsWith('http') ? user.photo : `${API_URL}/uploads/${user.photo}`}
                alt={user.name}
                title="Clique para trocar a foto"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
              />
            ) : (
              <span
                title="Clique para adicionar foto"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#5c6bc0',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {(user?.name || 'P').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            )}
            <span className="header-user">{user?.name || 'Professor'}</span>
            <button type="button" className="header-logout" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
      <BottomNav items={professorBottomNavItems} onMenuClick={() => setSidebarOpen(true)} />
    </div>
  )
}
