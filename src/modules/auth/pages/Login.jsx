import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../../services/auth.service'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated()) {
      const role = useAuthStore.getState().user?.role
      const target = role === 'student' ? '/aluno' : role === 'teacher' ? '/professor' : '/dashboard'
      navigate(target, { replace: true })
    }
  }, [navigate, isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const isEmail = usuario.includes('@')
      let data
      if (isEmail) {
        data = await authService.login(usuario, password)
      } else {
        try {
          data = await authService.loginStudent(usuario, password)
        } catch (errStudent) {
          if (errStudent.response?.status === 401) {
            data = await authService.loginTeacher(usuario, password)
          } else {
            throw errStudent
          }
        }
      }
      login(data.user, data.access_token)
      toast.success('Bem-vindo de volta!')
      const role = data.user.role
      const target = role === 'student' ? '/aluno' : role === 'teacher' ? '/professor' : '/dashboard'
      navigate(target, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Gestão Escolar</h1>
        <h2>Entrar</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            E-mail ou CPF
            <input
              type="text"
              placeholder="E-mail (gestão) ou CPF (aluno)"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoComplete="username"
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
