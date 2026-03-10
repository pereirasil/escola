import { useState } from 'react'
import { Outlet, useNavigate, NavLink, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { NotificationBell } from '../components/ui'

export default function AlunoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

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
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay sidebar-overlay-visible" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink to="/aluno/dados" className={linkClass} onClick={handleLinkClick}>Meus dados</NavLink>
          <NavLink to="/aluno/notificacoes" className={linkClass} onClick={handleLinkClick}>Notificacoes</NavLink>
          <NavLink to="/aluno/alterar-senha" className={linkClass} onClick={handleLinkClick}>Alterar senha</NavLink>
        </nav>
      </aside>
      <div className="layout-main">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button type="button" className="sidebar-toggle" onClick={() => setSidebarOpen(prev => !prev)} aria-label="Menu">
              &#9776;
            </button>
            <h1 className="header-title">Area do Aluno</h1>
          </div>
          <div className="header-actions">
            <NotificationBell />
            <span className="header-user">{user?.name || 'Aluno'}</span>
            <button type="button" className="header-logout" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
