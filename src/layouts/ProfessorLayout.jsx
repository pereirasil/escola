import { useState } from 'react'
import { Outlet, useNavigate, NavLink, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function ProfessorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

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
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay sidebar-overlay-visible" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink to="/professor/turmas" className={linkClass} onClick={handleLinkClick}>Minhas Turmas</NavLink>
          <NavLink to="/professor/faltas" className={linkClass} onClick={handleLinkClick}>Lancamento de Faltas</NavLink>
          <NavLink to="/professor/notas" className={linkClass} onClick={handleLinkClick}>Lancamento de Notas</NavLink>
          <NavLink to="/professor/historico" className={linkClass} onClick={handleLinkClick}>Historico e Graficos</NavLink>
          <NavLink to="/professor/alterar-senha" className={linkClass} onClick={handleLinkClick}>Alterar Senha</NavLink>
        </nav>
      </aside>
      <div className="layout-main">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button type="button" className="sidebar-toggle" onClick={() => setSidebarOpen(prev => !prev)} aria-label="Menu">
              &#9776;
            </button>
            <h1 className="header-title">Area do Professor</h1>
          </div>
          <div className="header-actions">
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
    </div>
  )
}
