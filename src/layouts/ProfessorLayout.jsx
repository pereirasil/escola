import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, NavLink, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { professoresService } from '../services/professores.service'
import BottomNav from '../components/BottomNav'
import NoIndex from '../components/NoIndex'
import { NotificationBell } from '../components/ui'

const professorBottomNavItems = [
  { key: 'inicio', to: '/professor', label: 'Início', icon: 'dashboard', end: true },
  { key: 'turmas', to: '/professor/turmas', label: 'Turmas', icon: 'turmas', end: false },
  { key: 'faltas', to: '/professor/faltas', label: 'Faltas', icon: 'faltas', end: false },
  { key: 'notas', to: '/professor/notas', label: 'Notas', icon: 'notas', end: false },
  { key: 'menu', type: 'button', label: 'Menu', icon: 'menu' },
]

export default function ProfessorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [headerInfo, setHeaderInfo] = useState({ teacher_name: null, school_name: null })
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const isDashboard = location.pathname === '/professor'

  useEffect(() => {
    professoresService.headerInfo()
      .then(setHeaderInfo)
      .catch(() => {})
  }, [])

  if (user?.role !== 'teacher') {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')
  const handleLinkClick = () => setSidebarOpen(false)

  return (
    <div className="layout layout-professor">
      <NoIndex />
      {sidebarOpen && <div className="sidebar-overlay sidebar-overlay-visible" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink to="/professor" className={linkClass} onClick={handleLinkClick} end>Menu Inicial</NavLink>
          <NavLink to="/professor/turmas" className={linkClass} onClick={handleLinkClick}>Minhas Turmas</NavLink>
          <NavLink to="/professor/faltas" className={linkClass} onClick={handleLinkClick}>Lançamento de Faltas</NavLink>
          <NavLink to="/professor/notas" className={linkClass} onClick={handleLinkClick}>Lançamento de Notas</NavLink>
          <NavLink to="/professor/historico" className={linkClass} onClick={handleLinkClick}>Histórico e Gráficos</NavLink>
          <NavLink to="/professor/alterar-senha" className={linkClass} onClick={handleLinkClick}>Alterar senha</NavLink>
          <div className="sidebar-divider" />
          <button type="button" className="sidebar-link sidebar-link-logout" onClick={() => { handleLinkClick(); handleLogout(); }}>
            Sair
          </button>
        </nav>
      </aside>
      <div className="layout-main">
        <header className={`aluno-header-bar ${isDashboard ? '' : 'aluno-header-bar-sub'}`}>
          <div className="aluno-header-left">
            <button type="button" className="aluno-header-menu" onClick={() => setSidebarOpen(prev => !prev)} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="aluno-header-user">{headerInfo.teacher_name || user?.name || 'Professor'}</span>
          </div>
          <div className="aluno-header-right">
            <NotificationBell />
            <span className="aluno-logo-badge">{headerInfo.school_name || 'Gestão Escolar'}</span>
          </div>
        </header>
        <main className={`layout-content ${isDashboard ? 'layout-content-dashboard' : ''}`}>
          <Outlet />
        </main>
      </div>
      <BottomNav items={professorBottomNavItems} onMenuClick={() => setSidebarOpen(true)} />
    </div>
  )
}
