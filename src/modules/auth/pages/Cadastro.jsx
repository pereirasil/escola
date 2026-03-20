import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
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
    accepted_terms: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [pix, setPix] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setPix(null)
    const { accepted_terms, ...registerData } = form
    authService
      .register(registerData)
      .then((res) => {
        setSuccess(true)
        setPix(res.data?.pix || null)
        toast.success('Cadastro realizado!')
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Erro ao cadastrar. Tente novamente.')
      })
      .finally(() => setLoading(false))
  }

  const helmetBlock = (
    <Helmet>
      <title>Cadastrar Escola - Sistema de Gestão Escolar</title>
      <meta name="description" content="Cadastre sua escola no sistema de gestão escolar. Software completo para controle de alunos, professores, notas e financeiro." />
      <meta name="robots" content="index,follow" />
      <meta property="og:title" content="Cadastrar Escola - Sistema de Gestão Escolar" />
      <meta property="og:description" content="Cadastre sua escola no sistema de gestão escolar. Software completo para controle de alunos, professores, notas e financeiro." />
      <meta property="og:url" content="https://gestaoescolar.com.br/cadastro" />
      <meta property="og:image" content="https://gestaoescolar.com.br/og-image.png" />
      <meta name="twitter:image" content="https://gestaoescolar.com.br/og-image.png" />
      <link rel="canonical" href="https://gestaoescolar.com.br/cadastro" />
    </Helmet>
  )

  if (success) {
    return (
      <>
        {helmetBlock}
        <main>
          <div className="auth-page">
            <div className="auth-hero">
              <div className="auth-hero-content">
                <h1 className="auth-hero-title">Gestão Escolar</h1>
                <p className="auth-hero-subtitle">
                  Cadastro recebido com sucesso. Em breve sua escola terá acesso à plataforma.
                </p>
              </div>
            </div>
            <div className="auth-login-side">
              <div className="auth-card auth-card-success">
                <h2>Cadastro enviado</h2>
                <p className="auth-card-subtitle">Confira seu e-mail para atualizações</p>
                <p className="auth-message" style={{ whiteSpace: 'pre-line' }}>
                  Cadastro realizado com sucesso!

Para ativar seu acesso, realize o pagamento utilizando o QR Code PIX abaixo.

Assim que o pagamento for confirmado, em até 24 horas liberaremos seu acesso.

Em caso de dúvidas, entre em contato pelo telefone: 21990443914
                </p>
                {pix && (
                  <div className="auth-pix-cadastro" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Taxa de cadastro: R$ 99,99</p>
                    <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>
                      Pague via PIX para concluir. O valor será creditado na conta configurada.
                    </p>
                    {pix.qr_code && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                        <img
                          src={`data:image/png;base64,${pix.qr_code}`}
                          alt="QR Code PIX"
                          width={180}
                          height={180}
                        />
                      </div>
                    )}
                    {pix.qr_code_text && (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ width: '100%' }}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(pix.qr_code_text)
                            toast.success('Código PIX copiado.')
                          } catch {
                            toast.error('Não foi possível copiar.')
                          }
                        }}
                      >
                        Copiar código PIX
                      </button>
                    )}
                  </div>
                )}
                <p className="auth-footer">
                  <Link to="/login">Voltar para o login</Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      {helmetBlock}
      <main>
        <div className="auth-page">
          <div className="auth-hero">
            <div className="auth-hero-content">
              <h1 className="auth-hero-title">Gestão Escolar</h1>
              <p className="auth-hero-subtitle">
                Cadastre sua escola e comece a transformar a administração em poucos minutos.
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
                Junte-se às escolas que buscam eficiência e resultados.
              </p>
            </div>
          </div>

          <div className="auth-login-side">
            <div className="auth-card">
              <h2>Cadastre sua escola</h2>
              <p className="auth-card-subtitle">Preencha os dados abaixo para criar sua conta</p>
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
                  Nome do responsável
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
                <label style={{ marginBottom: '0.25rem' }}>
                  Senha (mínimo 6 caracteres)
                  <div style={{ position: 'relative', width: '100%', marginTop: '0.25rem' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      autoComplete="new-password"
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
                        lineHeight: 0,
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
                <div className="terms-container">
                  <input
                    type="checkbox"
                    id="terms"
                    name="accepted_terms"
                    checked={form.accepted_terms}
                    onChange={(e) => setForm({ ...form, accepted_terms: e.target.checked })}
                    required
                  />
                  <label htmlFor="terms" className="terms-label">
                    Li e concordo com o <Link to="/termo-de-uso">Termo de Uso</Link>
                  </label>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </form>
              <p className="auth-footer">
                Já tem conta? <Link to="/login">Entrar</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
