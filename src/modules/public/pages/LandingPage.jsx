import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import '../public.css'

export default function LandingPage() {
  return (
    <>
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
          <h1>Sistema de Gestao Escolar</h1>
          <p>
            A plataforma completa para administrar sua escola com eficiencia.
            Controle de alunos, professores, notas, presenca, turmas e financeiro
            em um unico lugar. Simples, rapido e seguro.
          </p>
          <div className="landing-hero-actions">
            <Link to="/cadastro" className="landing-btn landing-btn-primary">
              Comece Gratuitamente
            </Link>
            <Link to="/funcionalidades" className="landing-btn landing-btn-secondary">
              Conheca as Funcionalidades
            </Link>
          </div>
        </div>
      </section>

      <div className="landing-stats">
        <div>
          <span className="landing-stat-number">100%</span>
          <span className="landing-stat-label">Online e na nuvem</span>
        </div>
        <div>
          <span className="landing-stat-number">24/7</span>
          <span className="landing-stat-label">Acesso a qualquer momento</span>
        </div>
        <div>
          <span className="landing-stat-number">Gratis</span>
          <span className="landing-stat-label">Para comecar a usar</span>
        </div>
      </div>

      <section className="landing-section">
        <h2>Tudo que sua escola precisa em um so sistema</h2>
        <p>
          Software completo para gestao escolar. Automatize processos, reduza
          burocracia e foque no que realmente importa: a educacao.
        </p>
        <div className="landing-features-grid">
          <article className="landing-feature-card">
            <div className="landing-feature-icon">&#9998;</div>
            <h3>Controle de Alunos</h3>
            <p>
              Cadastro completo de alunos com dados pessoais, matriculas,
              historico escolar e acompanhamento individual de desempenho.
              Sistema para controle de alunos com informacoes centralizadas.
            </p>
          </article>
          <article className="landing-feature-card">
            <div className="landing-feature-icon">&#9670;</div>
            <h3>Gestao de Professores</h3>
            <p>
              Gerencie o corpo docente com cadastro de professores, atribuicao
              de turmas e materias, controle de carga horaria e comunicacao
              integrada com a coordenacao.
            </p>
          </article>
          <article className="landing-feature-card">
            <div className="landing-feature-icon">&#9733;</div>
            <h3>Notas e Boletins</h3>
            <p>
              Lancamento de notas por disciplina e periodo, geracao de boletins
              e acompanhamento do desempenho academico dos alunos com
              relatorios detalhados.
            </p>
          </article>
          <article className="landing-feature-card">
            <div className="landing-feature-icon">&#10003;</div>
            <h3>Controle de Presenca</h3>
            <p>
              Registro de frequencia diaria por turma, relatorios de presenca
              e ausencia, alertas automaticos para alunos com muitas faltas
              e historico completo.
            </p>
          </article>
          <article className="landing-feature-card">
            <div className="landing-feature-icon">&#36;</div>
            <h3>Controle Financeiro</h3>
            <p>
              Gestao de mensalidades, controle de pagamentos, geracao de
              boletos e relatorios financeiros completos. Mantenha as
              financas da escola organizadas.
            </p>
          </article>
          <article className="landing-feature-card">
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
        <h2>Pronto para transformar a gestao da sua escola?</h2>
        <p>
          Cadastre-se gratuitamente e comece a usar o sistema de gestao escolar
          mais completo do mercado. Sem necessidade de instalacao.
        </p>
        <div className="landing-hero-actions">
          <Link to="/cadastro" className="landing-btn landing-btn-primary">
            Cadastrar Minha Escola
          </Link>
          <Link to="/login" className="landing-btn landing-btn-secondary">
            Ja Tenho Conta
          </Link>
        </div>
      </section>

      <PublicFooter />
    </>
  )
}
