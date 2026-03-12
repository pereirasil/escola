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
        <title>Sistema de Gestão Escolar Online | Controle de Alunos, Notas e Professores</title>
        <meta name="description" content="Sistema completo de gestão escolar online. Controle de alunos, professores, notas, presença, turmas e financeiro. Software para escola com painel administrativo e relatórios inteligentes." />
        <meta property="og:title" content="Sistema de Gestão Escolar Online | Controle de Alunos, Notas e Professores" />
        <meta property="og:description" content="Sistema completo de gestão escolar online. Controle de alunos, professores, notas, presença, turmas e financeiro." />
        <meta property="og:url" content="https://gestaoescolar.com.br/" />
        <link rel="canonical" href="https://gestaoescolar.com.br/" />
      </Helmet>

      <PublicNav />

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <h1 className="reveal">Sistema de Gestão Escolar</h1>
          <p className="reveal reveal-delay-1">
            A plataforma completa para administrar sua escola com eficiência.
            Controle de alunos, professores, notas, presença, turmas e financeiro
            em um único lugar. Simples, rápido e seguro.
          </p>
          <div className="landing-hero-actions reveal reveal-delay-2">
            <Link to="/cadastro" className="landing-btn landing-btn-primary">
              Cadastre-se
            </Link>
            <Link to="/funcionalidades" className="landing-btn landing-btn-secondary">
              Conheça as Funcionalidades
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
          <span className="landing-stat-number">Grátis</span>
          <span className="landing-stat-label">Para começar a usar</span>
        </div>
      </div>

      <section className="landing-section">
        <h2 className="reveal">Tudo que sua escola precisa em um só sistema</h2>
        <p className="reveal reveal-delay-1">
          Software completo para gestão escolar. Automatize processos, reduza
          burocracia e foque no que realmente importa: a educação.
        </p>
        <div className="landing-features-grid">
          <article className="landing-feature-card reveal reveal-scale reveal-delay-1">
            <div className="landing-feature-icon">&#9998;</div>
            <h3>Controle de Alunos</h3>
            <p>
              Cadastro completo de alunos com dados pessoais, matrículas,
              histórico escolar e acompanhamento individual de desempenho.
              Sistema para controle de alunos com informações centralizadas.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-2">
            <div className="landing-feature-icon">&#9670;</div>
            <h3>Gestão de Professores</h3>
            <p>
              Gerencie o corpo docente com cadastro de professores, atribuição
              de turmas e matérias, controle de carga horária e comunicação
              integrada com a coordenação.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-3">
            <div className="landing-feature-icon">&#9733;</div>
            <h3>Notas e Boletins</h3>
            <p>
              Lançamento de notas por disciplina e período, geração de boletins
              e acompanhamento do desempenho acadêmico dos alunos com
              relatórios detalhados.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-4">
            <div className="landing-feature-icon">&#10003;</div>
            <h3>Controle de Presença</h3>
            <p>
              Registro de frequência diária por turma, relatórios de presença
              e ausência, alertas automáticos para alunos com muitas faltas
              e histórico completo.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-5">
            <div className="landing-feature-icon">&#36;</div>
            <h3>Controle Financeiro</h3>
            <p>
              Gestão de mensalidades, controle de pagamentos, geração de
              boletos e relatórios financeiros completos. Mantenha as
              finanças da escola organizadas.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-6">
            <div className="landing-feature-icon">&#9776;</div>
            <h3>Grade Horária e Turmas</h3>
            <p>
              Montagem de turmas, definição de grade horária, atribuição de
              professores por disciplina e gestão completa do calendário
              escolar com datas comemorativas.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <h2 className="reveal">Pronto para transformar a gestão da sua escola?</h2>
        <p className="reveal reveal-delay-1">
          Cadastre-se gratuitamente e comece a usar o sistema de gestão escolar
          mais completo do mercado. Sem necessidade de instalação.
        </p>
        <div className="landing-hero-actions reveal reveal-delay-2">
          <Link to="/cadastro" className="landing-btn landing-btn-primary">
            Cadastrar Minha Escola
          </Link>
          <Link to="/login" className="landing-btn landing-btn-secondary">
            Já Tenho Conta
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
