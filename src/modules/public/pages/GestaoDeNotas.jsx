import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import useScrollReveal from '../../../hooks/useScrollReveal'
import '../public.css'

export default function GestaoDeNotas() {
  const revealRef = useScrollReveal()

  return (
    <div ref={revealRef}>
      <Helmet>
        <title>Gestão de Notas Escolares | Sistema para Lançamento e Boletins - Gestão Escolar</title>
        <meta name="description" content="Sistema de gestão de notas para escolas: lançamento de notas por disciplina, geração de boletins e acompanhamento de desempenho. Plataforma para controle de notas online." />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content="Gestão de Notas Escolares | Sistema para Lançamento e Boletins" />
        <meta property="og:description" content="Sistema de gestão de notas para escolas: lançamento de notas por disciplina, geração de boletins e acompanhamento de desempenho." />
        <meta property="og:url" content="https://gestaoescolar.com.br/gestao-de-notas" />
        <meta property="og:image" content="https://gestaoescolar.com.br/og-image.png" />
        <meta name="twitter:image" content="https://gestaoescolar.com.br/og-image.png" />
        <link rel="canonical" href="https://gestaoescolar.com.br/gestao-de-notas" />
      </Helmet>

      <header>
        <PublicNav />
      </header>

      <main>
      <section className="landing-hero" style={{ minHeight: '50vh' }}>
        <div className="landing-hero-inner">
          <h1 className="reveal">Gestão de Notas Escolares</h1>
          <p className="reveal reveal-delay-1">
            Sistema para gestão de notas: lançamento por turma e disciplina,
            geração de boletins e acompanhamento do desempenho dos alunos.
            Elimine cadernetas e planilhas de notas.
          </p>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="reveal">Como funciona a gestão de notas no sistema</h2>
        <p className="reveal reveal-delay-1">
          O lançamento de notas é simples e rápido. Professores acessam
          pelo celular ou computador e registram as avaliações diretamente
          no sistema.
        </p>

        <div className="landing-features-grid">
          <article className="landing-feature-card reveal reveal-scale reveal-delay-1">
            <h3>Lançamento de Notas</h3>
            <p>
              Professores lançam notas por turma e disciplina. O processo
              é intuitivo e elimina a necessidade de cadernetas físicas
              ou planilhas de Excel.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-2">
            <h3>Boletins Automáticos</h3>
            <p>
              Geração automática de boletins e relatórios de desempenho.
              Alunos e responsáveis podem acompanhar as notas a qualquer
              momento pela plataforma.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-3">
            <h3>Acompanhamento de Desempenho</h3>
            <p>
              Visualize a evolução de cada aluno ao longo dos períodos.
              Identifique alunos com dificuldades e acompanhe o progresso
              acadêmico da turma.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-4">
            <h3>Controle de Períodos</h3>
            <p>
              Defina bimestres, trimestres ou semestres conforme o
              calendário da escola. O sistema organiza as notas por
              período automaticamente.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <h2 className="reveal">Simplifique a gestão de notas da sua escola</h2>
        <p className="reveal reveal-delay-1">
          Cadastre sua escola e comece a lançar notas online.
          Tudo integrado e organizado.
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
