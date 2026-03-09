import { Outlet, useNavigate, NavLink, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function ProfessorLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  if (user?.role !== 'teacher') {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <NavLink to="/professor/turmas" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            Minhas Turmas
          </NavLink>
          <NavLink to="/professor/faltas" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            Lançamento de Faltas
          </NavLink>
          <NavLink to="/professor/notas" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            Lançamento de Notas
          </NavLink>
          <NavLink to="/professor/historico" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            Histórico e Gráficos
          </NavLink>
          <NavLink to="/professor/alterar-senha" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            Alterar Senha
          </NavLink>
        </nav>
      </aside>
      <div className="layout-main">
        <header className="header">
          <h1 className="header-title">Área do Professor</h1>
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
