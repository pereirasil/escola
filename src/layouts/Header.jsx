import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="header">
      <h1 className="header-title">Gestão Escolar</h1>
      <div className="header-actions">
        <span className="header-user">{user?.name || user?.email || 'Usuário'}</span>
        <button type="button" className="header-logout" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  )
}
