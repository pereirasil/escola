import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../../services/auth.service'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const { login, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, isAuthenticated])

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    authService
      .login(email, password)
      .then((data) => {
        login(data.user, data.access_token)
        toast.success('Bem-vindo de volta!')
        navigate('/dashboard', { replace: true })
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Erro ao entrar. Tente novamente.')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Gestão Escolar</h1>
        <h2>Entrar</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label style={{ marginBottom: '0.25rem' }}>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <div style={{ textAlign: 'right', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <Link to="/cadastro" style={{ color: '#646cff', textDecoration: 'none' }}>Cadastre-se</Link>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
      </div>
    </div>
  )
}
