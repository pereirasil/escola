import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function AlunoLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  if (user?.role !== 'student') {
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
          <NavLink to="/aluno/dados" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            Meus dados
          </NavLink>
          <NavLink to="/aluno/notificacoes" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            Notificações
          </NavLink>
          <NavLink to="/aluno/alterar-senha" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            Alterar senha
          </NavLink>
        </nav>
      </aside>
      <div className="layout-main">
        <header className="header">
          <h1 className="header-title">Área do Aluno</h1>
          <div className="header-actions">
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
