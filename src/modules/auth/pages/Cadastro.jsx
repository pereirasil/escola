import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../../services/auth.service'
import toast from 'react-hot-toast'

export default function Cadastro() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    authService
      .register(name, email, password)
      .then(() => {
        setSuccess(true)
        toast.success('Cadastro realizado!')
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Erro ao cadastrar. Tente novamente.')
      })
      .finally(() => setLoading(false))
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Gestão Escolar</h1>
          <h2>Cadastro enviado</h2>
          <p className="auth-message">
            Sua escola foi cadastrada. Você só terá acesso após o administrador geral aprovar seu cadastro. Aguarde e tente entrar mais tarde.
          </p>
          <p className="auth-footer">
            <Link to="/login">Voltar para o login</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Gestão Escolar</h1>
        <h2>Cadastre sua escola</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Nome da escola
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              autoComplete="organization"
            />
          </label>
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
          <label>
            Senha (mínimo 6 caracteres)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <p className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
