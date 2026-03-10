import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../../services/auth.service'
import toast from 'react-hot-toast'

export default function Cadastro() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    responsible_name: '',
    cnpj: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    authService
      .register(form)
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
          <h1>Gestao Escolar</h1>
          <h2>Cadastro enviado</h2>
          <p className="auth-message">
            Sua escola foi cadastrada. Voce so tera acesso apos o administrador geral aprovar seu cadastro. Aguarde e tente entrar mais tarde.
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
        <h1>Gestao Escolar</h1>
        <h2>Cadastre sua escola</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Nome da escola
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
              autoComplete="organization"
            />
          </label>
          <label>
            Nome do responsavel
            <input
              type="text"
              name="responsible_name"
              value={form.responsible_name}
              onChange={handleChange}
              required
              minLength={2}
              autoComplete="name"
            />
          </label>
          <label>
            CNPJ (opcional)
            <input
              type="text"
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              autoComplete="off"
            />
          </label>
          <label>
            Celular
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="(00) 00000-0000"
              autoComplete="tel"
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Senha (minimo 6 caracteres)
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
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
          Ja tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
