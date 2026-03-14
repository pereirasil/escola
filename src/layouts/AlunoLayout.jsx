import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, NavLink, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Calendar,
  CalendarDays,
  Users,
  User,
  Key,
  Bell,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { alunosService } from '../services/alunos.service'
import BottomNav from '../components/BottomNav'
import NoIndex from '../components/NoIndex'
import { NotificationBell } from '../components/ui'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const alunoBottomNavItems = [
  { key: 'inicio', to: '/aluno', label: 'Início', icon: 'dashboard', end: true },
  { key: 'horarios', to: '/aluno/horarios', label: 'Calendário', icon: 'horarios', end: false },
  { key: 'historico', to: '/aluno/historico', label: 'Pedagógico', icon: 'historico', end: false },
  { key: 'menu', type: 'button', label: 'Menu', icon: 'menu' },
]

const menuSections = [
  {
    title: 'Painel',
    items: [
      { to: '/aluno', label: 'Menu Inicial', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Acadêmico',
    items: [
      { to: '/aluno/historico', label: 'Histórico', icon: FileText, end: false },
      { to: '/aluno/horarios', label: 'Horários', icon: Calendar, end: false },
      { to: '/aluno/datas', label: 'Datas Importantes', icon: CalendarDays, end: false },
      { to: '/aluno/reunioes', label: 'Reuniões', icon: Users, end: false },
    ],
  },
  {
    title: 'Conta',
    items: [
      { to: '/aluno/dados', label: 'Meus dados', icon: User, end: false },
      { to: '/aluno/alterar-senha', label: 'Alterar senha', icon: Key, end: false },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/aluno/comunicacao', label: 'Comunicação', icon: Bell, end: false },
    ],
  },
]

export default function AlunoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [headerInfo, setHeaderInfo] = useState({ guardian_name: null, school_name: null })
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const isDashboard = location.pathname === '/aluno'
  const isPedagogico = location.pathname.startsWith('/aluno/historico')

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

  const linkClass = ({ isActive }) => `sidebar-link sidebar-link-aluno ${isActive ? 'active' : ''}`
  const handleLinkClick = () => setSidebarOpen(false)

  return (
    <div className="layout layout-aluno">
      <NoIndex />
      {sidebarOpen && <div className="sidebar-overlay sidebar-overlay-visible" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar sidebar-aluno${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-aluno-user">
          <div className="sidebar-aluno-photo">
            {user?.photo ? (
              <img
                src={user.photo.startsWith('http') ? user.photo : `${API_URL}/uploads/${user.photo}`}
                alt={user.name}
              />
            ) : (
              <div className="sidebar-aluno-photo-placeholder">
                <User size={24} strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="sidebar-aluno-info">
            <span className="sidebar-aluno-name">{user?.name || 'Aluno'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuSections.map((section) => (
            <div key={section.title} className="sidebar-aluno-section">
              <div className="sidebar-section-title">{section.title}</div>
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={linkClass}
                    onClick={handleLinkClick}
                    end={item.end}
                  >
                    <Icon size={18} strokeWidth={2} className="sidebar-link-icon" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          ))}

          <div className="sidebar-divider sidebar-divider-aluno" />
          <button
            type="button"
            className="sidebar-link sidebar-link-aluno sidebar-link-logout"
            onClick={() => { handleLinkClick(); handleLogout(); }}
          >
            <LogOut size={18} strokeWidth={2} className="sidebar-link-icon" />
            Sair
          </button>
        </nav>
      </aside>
      <div className="layout-main">
        <header className={`aluno-header-bar ${isDashboard ? '' : 'aluno-header-bar-sub'} ${isPedagogico ? 'aluno-header-pedagogico' : ''}`}>
          <div className="aluno-header-left">
            <button type="button" className="aluno-header-menu" onClick={() => setSidebarOpen(prev => !prev)} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {!isPedagogico && <span className="aluno-header-user">{headerInfo.guardian_name || user?.name || 'Aluno'}</span>}
          </div>
          {isPedagogico && <h1 className="aluno-header-title">Pedagógico</h1>}
          <div className="aluno-header-right">
            <NotificationBell />
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
