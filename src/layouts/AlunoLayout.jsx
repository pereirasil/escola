import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, NavLink, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { alunosService } from '../services/alunos.service'
import BottomNav from '../components/BottomNav'
import NoIndex from '../components/NoIndex'

const alunoBottomNavItems = [
  { key: 'inicio', to: '/aluno', label: 'Início', icon: 'dashboard', end: true },
  { key: 'horarios', to: '/aluno/horarios', label: 'Calendário', icon: 'horarios', end: false },
  { key: 'historico', to: '/aluno/historico', label: 'Pedagógico', icon: 'historico', end: false },
  { key: 'menu', type: 'button', label: 'Menu', icon: 'menu' },
]

export default function AlunoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [headerInfo, setHeaderInfo] = useState({ guardian_name: null, school_name: null })
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const isDashboard = location.pathname === '/aluno'

  useEffect(() => {
    alunosService.headerInfo()
      .then(setHeaderInfo)
      .catch(() => {})
  }, [])

  if (user?.role !== 'student') {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')
  const handleLinkClick = () => setSidebarOpen(false)

  return (
    <div className="layout layout-aluno">
      <NoIndex />
      {sidebarOpen && <div className="sidebar-overlay sidebar-overlay-visible" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink to="/aluno" className={linkClass} onClick={handleLinkClick} end>Menu Inicial</NavLink>
          <NavLink to="/aluno/dados" className={linkClass} onClick={handleLinkClick}>Meus dados</NavLink>
          <NavLink to="/aluno/historico" className={linkClass} onClick={handleLinkClick}>Histórico</NavLink>
          <NavLink to="/aluno/horarios" className={linkClass} onClick={handleLinkClick}>Horários</NavLink>
          <NavLink to="/aluno/notificacoes" className={linkClass} onClick={handleLinkClick}>Notificações</NavLink>
          <NavLink to="/aluno/datas" className={linkClass} onClick={handleLinkClick}>Datas Importantes</NavLink>
          <NavLink to="/aluno/alterar-senha" className={linkClass} onClick={handleLinkClick}>Alterar senha</NavLink>
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
            <span className="aluno-header-user">{headerInfo.guardian_name || user?.name || 'Aluno'}</span>
          </div>
          <div className="aluno-header-right">
            <span className="aluno-logo-badge">{headerInfo.school_name || 'Gestão Escolar'}</span>
          </div>
        </header>
        <main className={`layout-content ${isDashboard ? 'layout-content-dashboard' : ''}`}>
          <Outlet />
        </main>
      </div>
      <BottomNav items={alunoBottomNavItems} onMenuClick={() => setSidebarOpen(true)} />
    </div>
  )
}
