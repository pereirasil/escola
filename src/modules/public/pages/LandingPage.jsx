import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import useScrollReveal from '../../../hooks/useScrollReveal'
import '../public.css'

export default function LandingPage() {
  const revealRef = useScrollReveal()

  return (
    <div ref={revealRef}>
      <Helmet>
        <title>Sistema de Gestao Escolar Online | Controle de Alunos, Notas e Professores</title>
        <meta name="description" content="Sistema completo de gestao escolar online. Controle de alunos, professores, notas, presenca, turmas e financeiro. Software para escola com painel administrativo e relatorios inteligentes." />
        <meta property="og:title" content="Sistema de Gestao Escolar Online | Controle de Alunos, Notas e Professores" />
        <meta property="og:description" content="Sistema completo de gestao escolar online. Controle de alunos, professores, notas, presenca, turmas e financeiro." />
        <meta property="og:url" content="https://gestaoescolar.com.br/" />
        <link rel="canonical" href="https://gestaoescolar.com.br/" />
      </Helmet>

      <PublicNav />

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <h1 className="reveal">Sistema de Gestao Escolar</h1>
          <p className="reveal reveal-delay-1">
            A plataforma completa para administrar sua escola com eficiencia.
            Controle de alunos, professores, notas, presenca, turmas e financeiro
            em um unico lugar. Simples, rapido e seguro.
          </p>
          <div className="landing-hero-actions reveal reveal-delay-2">
            <Link to="/cadastro" className="landing-btn landing-btn-primary">
              Cadastre-se
            </Link>
            <Link to="/funcionalidades" className="landing-btn landing-btn-secondary">
              Conheca as Funcionalidades
            </Link>
          </div>
        </div>
      </section>

      <div className="landing-stats">
        <div className="reveal reveal-delay-1">
          <span className="landing-stat-number">100%</span>
          <span className="landing-stat-label">Online e na nuvem</span>
        </div>
        <div className="reveal reveal-delay-2">
          <span className="landing-stat-number">24/7</span>
          <span className="landing-stat-label">Acesso a qualquer momento</span>
        </div>
        <div className="reveal reveal-delay-3">
          <span className="landing-stat-number">Gratis</span>
          <span className="landing-stat-label">Para comecar a usar</span>
        </div>
      </div>

      <section className="landing-section">
        <h2 className="reveal">Tudo que sua escola precisa em um so sistema</h2>
        <p className="reveal reveal-delay-1">
          Software completo para gestao escolar. Automatize processos, reduza
          burocracia e foque no que realmente importa: a educacao.
        </p>
        <div className="landing-features-grid">
          <article className="landing-feature-card reveal reveal-scale reveal-delay-1">
            <div className="landing-feature-icon">&#9998;</div>
            <h3>Controle de Alunos</h3>
            <p>
              Cadastro completo de alunos com dados pessoais, matriculas,
              historico escolar e acompanhamento individual de desempenho.
              Sistema para controle de alunos com informacoes centralizadas.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-2">
            <div className="landing-feature-icon">&#9670;</div>
            <h3>Gestao de Professores</h3>
            <p>
              Gerencie o corpo docente com cadastro de professores, atribuicao
              de turmas e materias, controle de carga horaria e comunicacao
              integrada com a coordenacao.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-3">
            <div className="landing-feature-icon">&#9733;</div>
            <h3>Notas e Boletins</h3>
            <p>
              Lancamento de notas por disciplina e periodo, geracao de boletins
              e acompanhamento do desempenho academico dos alunos com
              relatorios detalhados.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-4">
            <div className="landing-feature-icon">&#10003;</div>
            <h3>Controle de Presenca</h3>
            <p>
              Registro de frequencia diaria por turma, relatorios de presenca
              e ausencia, alertas automaticos para alunos com muitas faltas
              e historico completo.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-5">
            <div className="landing-feature-icon">&#36;</div>
            <h3>Controle Financeiro</h3>
            <p>
              Gestao de mensalidades, controle de pagamentos, geracao de
              boletos e relatorios financeiros completos. Mantenha as
              financas da escola organizadas.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-6">
            <div className="landing-feature-icon">&#9776;</div>
            <h3>Grade Horaria e Turmas</h3>
            <p>
              Montagem de turmas, definicao de grade horaria, atribuicao de
              professores por disciplina e gestao completa do calendario
              escolar com datas comemorativas.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <h2 className="reveal">Pronto para transformar a gestao da sua escola?</h2>
        <p className="reveal reveal-delay-1">
          Cadastre-se gratuitamente e comece a usar o sistema de gestao escolar
          mais completo do mercado. Sem necessidade de instalacao.
        </p>
        <div className="landing-hero-actions reveal reveal-delay-2">
          <Link to="/cadastro" className="landing-btn landing-btn-primary">
            Cadastrar Minha Escola
          </Link>
          <Link to="/login" className="landing-btn landing-btn-secondary">
            Ja Tenho Conta
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
