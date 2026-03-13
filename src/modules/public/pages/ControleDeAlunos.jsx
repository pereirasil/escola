import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import useScrollReveal from '../../../hooks/useScrollReveal'
import '../public.css'

export default function ControleDeAlunos() {
  const revealRef = useScrollReveal()

  return (
    <div ref={revealRef}>
      <Helmet>
        <title>Controle de Alunos Online | Sistema para Gestão de Alunos - Gestão Escolar</title>
        <meta name="description" content="Controle de alunos online: cadastro completo, histórico escolar, matrículas e frequência. Sistema para controle de alunos em uma plataforma simples e eficiente." />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content="Controle de Alunos Online | Sistema para Gestão de Alunos" />
        <meta property="og:description" content="Controle de alunos online: cadastro completo, histórico escolar, matrículas e frequência. Sistema para controle de alunos em uma plataforma simples e eficiente." />
        <meta property="og:url" content="https://gestaoescolar.com.br/controle-de-alunos" />
        <meta property="og:image" content="https://gestaoescolar.com.br/og-image.png" />
        <meta name="twitter:image" content="https://gestaoescolar.com.br/og-image.png" />
        <link rel="canonical" href="https://gestaoescolar.com.br/controle-de-alunos" />
      </Helmet>

      <header>
        <PublicNav />
      </header>

      <main>
      <section className="landing-hero" style={{ minHeight: '50vh' }}>
        <div className="landing-hero-inner">
          <h1 className="reveal">Controle de Alunos Online</h1>
          <p className="reveal reveal-delay-1">
            Sistema completo para controle de alunos. Cadastro, histórico
            escolar, matrículas, presença e notas em uma única plataforma.
            Gestão de alunos simplificada para sua escola.
          </p>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="reveal">Por que usar um sistema de controle de alunos?</h2>
        <p className="reveal reveal-delay-1">
          O controle de alunos online elimina planilhas e papéis, centraliza
          todas as informações e permite acompanhar cada estudante de perto.
        </p>

        <div className="landing-features-grid">
          <article className="landing-feature-card reveal reveal-scale reveal-delay-1">
            <h3>Cadastro Completo de Alunos</h3>
            <p>
              Registre dados pessoais, contatos dos responsáveis, documentos
              e endereço. Mantenha um cadastro único e sempre atualizado
              para cada aluno da escola.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-2">
            <h3>Histórico Escolar Integrado</h3>
            <p>
              Acompanhe notas, frequência e evolução acadêmica de cada aluno.
              Histórico completo disponível para consulta em segundos, sem
              buscar em pastas ou planilhas.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-3">
            <h3>Matrículas e Turmas</h3>
            <p>
              Gerencie matrículas, enturmação e transferências de forma
              organizada. Vincule alunos a turmas e acompanhe a situação
              de cada matrícula no sistema.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-4">
            <h3>Controle de Presença</h3>
            <p>
              Registro de frequência diária. Professores fazem a chamada
              online e o sistema gera relatórios de presença e ausência
              automaticamente para cada aluno.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <h2 className="reveal">Comece a controlar seus alunos online</h2>
        <p className="reveal reveal-delay-1">
          Cadastre sua escola e tenha acesso ao controle de alunos
          completo. Simples e eficiente.
        </p>
        <div className="landing-hero-actions reveal reveal-delay-2">
          <Link to="/cadastro" className="landing-btn landing-btn-primary">
            Cadastrar Minha Escola
          </Link>
          <Link to="/funcionalidades" className="landing-btn landing-btn-secondary">
            Ver Funcionalidades
          </Link>
        </div>
      </section>

      </main>

      <PublicFooter />
    </div>
  )
}
