import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { authService } from '../../../services/auth.service'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const avatarTimeout = useRef(null)
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated()) {
      const role = useAuthStore.getState().user?.role
      const target = role === 'student' ? '/aluno' : role === 'teacher' ? '/professor' : '/dashboard'
      navigate(target, { replace: true })
    }
  }, [navigate, isAuthenticated])

  useEffect(() => {
    clearTimeout(avatarTimeout.current)
    const cpfDigits = usuario.replace(/\D/g, '')
    if (cpfDigits.length >= 11 && !usuario.includes('@')) {
      avatarTimeout.current = setTimeout(() => {
        authService.getAvatarByCpf(cpfDigits)
          .then((data) => setAvatar(data))
          .catch(() => setAvatar(null))
      }, 500)
    } else {
      setAvatar(null)
    }
    return () => clearTimeout(avatarTimeout.current)
  }, [usuario])

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
      const msg = err.response?.data?.message
      if (msg) {
        toast.error(msg)
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        toast.error(`Não foi possível conectar à API (${baseURL}). Verifique se o backend está rodando.`)
      } else {
        toast.error('Erro ao entrar. Tente novamente.')
      }
      if (import.meta.env.DEV) {
        console.error('[Login]', err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <Helmet>
      <title>Entrar - Sistema de Gestão Escolar | Login</title>
      <meta name="description" content="Acesse o sistema de gestão escolar. Faça login como gestor, professor ou aluno e gerencie sua escola online." />
      <meta name="robots" content="index,follow" />
      <meta property="og:title" content="Entrar - Sistema de Gestão Escolar" />
      <meta property="og:description" content="Acesse o sistema de gestão escolar. Faça login como gestor, professor ou aluno." />
      <meta property="og:url" content="https://gestaoescolar.com.br/login" />
      <meta property="og:image" content="https://gestaoescolar.com.br/og-image.png" />
      <meta name="twitter:image" content="https://gestaoescolar.com.br/og-image.png" />
      <link rel="canonical" href="https://gestaoescolar.com.br/login" />
    </Helmet>
    <main>
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <h1 className="auth-hero-title">Gestão Escolar</h1>
          <p className="auth-hero-subtitle">
            A plataforma completa para transformar a administração da sua escola.
          </p>

          <div className="auth-hero-features">
            <div className="auth-hero-feature">
              <span className="auth-hero-feature-icon">&#9670;</span>
              <div>
                <strong>Gestão Integrada</strong>
                <p>Controle de turmas, matérias, horários e financeiro em um só lugar.</p>
              </div>
            </div>
            <div className="auth-hero-feature">
              <span className="auth-hero-feature-icon">&#9670;</span>
              <div>
                <strong>Acompanhamento em Tempo Real</strong>
                <p>Notas, presença e desempenho dos alunos atualizados instantaneamente.</p>
              </div>
            </div>
            <div className="auth-hero-feature">
              <span className="auth-hero-feature-icon">&#9670;</span>
              <div>
                <strong>Comunicação Eficiente</strong>
                <p>Professores, alunos e gestores conectados em uma única plataforma.</p>
              </div>
            </div>
            <div className="auth-hero-feature">
              <span className="auth-hero-feature-icon">&#9670;</span>
              <div>
                <strong>Relatórios Inteligentes</strong>
                <p>Dashboards e gráficos que facilitam a tomada de decisão.</p>
              </div>
            </div>
          </div>

          <p className="auth-hero-footer-text">
            Usado por escolas que buscam eficiência, organização e resultados.
          </p>
        </div>
      </div>

      <div className="auth-login-side">
        <div className="auth-card">
          <h2>Entrar</h2>
          <p className="auth-card-subtitle">Acesse sua conta para continuar</p>
          {avatar && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
              {avatar.photo ? (
                <img
                  src={avatar.photo.startsWith('http') ? avatar.photo : `${API_URL}/uploads/${avatar.photo}`}
                  alt={avatar.name || ''}
                  loading="lazy"
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #646cff' }}
                />
              ) : (
                <span
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: '#5c6bc0',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 28,
                    border: '3px solid #646cff',
                  }}
                >
                  {(avatar.name || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              )}
              {avatar.name && (
                <span style={{ marginTop: '0.5rem', fontWeight: 500, color: '#334155' }}>{avatar.name}</span>
              )}
            </div>
          )}
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
              <div style={{ position: 'relative', width: '100%', marginTop: '0.25rem' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '0.5rem',
                    transform: 'translateY(-50%)',
                    width: 'auto',
                    minWidth: 'unset',
                    margin: 0,
                    background: 'none',
                    border: 'none',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 0
                  }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
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
    </div>
    </main>
    </>
  )
}
