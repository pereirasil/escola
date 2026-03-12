import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import useScrollReveal from '../../../hooks/useScrollReveal'
import '../public.css'

export default function SistemaEscolar() {
  const revealRef = useScrollReveal()

  return (
    <div ref={revealRef}>
      <Helmet>
        <title>Sistema Escolar Online - Software de Gestão para Escolas | Gestão Escolar</title>
        <meta name="description" content="Conheça o sistema escolar online mais completo do mercado. Software de gestão para escolas com controle de alunos, professores, notas, presença e financeiro. Automatize a administração da sua escola." />
        <meta property="og:title" content="Sistema Escolar Online - Software de Gestão para Escolas" />
        <meta property="og:description" content="Conheça o sistema escolar online mais completo do mercado. Software de gestão para escolas com controle de alunos, professores, notas, presença e financeiro." />
        <meta property="og:url" content="https://gestaoescolar.com.br/sistema-escolar" />
        <link rel="canonical" href="https://gestaoescolar.com.br/sistema-escolar" />
      </Helmet>

      <PublicNav />

      <section className="landing-hero" style={{ minHeight: '50vh' }}>
        <div className="landing-hero-inner">
          <h1 className="reveal">Sistema Escolar Online</h1>
          <p className="reveal reveal-delay-1">
            Um software completo de gestão escolar pensado para facilitar
            o dia a dia de diretores, coordenadores, professores e alunos.
            Tudo na nuvem, acessível de qualquer lugar.
          </p>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="reveal">O que é o Sistema de Gestão Escolar?</h2>
        <p className="reveal reveal-delay-1">
          Uma plataforma digital que centraliza todas as operações
          administrativas e pedagógicas da sua instituição de ensino.
        </p>

        <div className="landing-features-grid">
          <article className="landing-feature-card reveal reveal-scale reveal-delay-1">
            <h3>Administração Simplificada</h3>
            <p>
              Nosso sistema de controle escolar elimina planilhas e papéis.
              Centralize dados de alunos, professores, turmas e financeiro
              em um único painel. Reduza erros e economize tempo com
              processos automatizados de gestão escolar.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-2">
            <h3>Acesso Multiusuário</h3>
            <p>
              Cada usuário tem seu perfil com permissões adequadas.
              Gestores acessam o painel completo, professores lançam notas
              e presença, alunos consultam boletins e histórico escolar.
              Tudo com segurança e privacidade.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-3">
            <h3>100% Online</h3>
            <p>
              Não precisa instalar nada. Acesse o software para escola
              de qualquer dispositivo com internet: computador, tablet ou
              celular. Dados armazenados na nuvem com backups automáticos
              e disponibilidade 24 horas.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-4">
            <h3>Relatórios Inteligentes</h3>
            <p>
              Dashboards com gráficos e indicadores que ajudam na tomada
              de decisão. Acompanhe desempenho acadêmico, frequência,
              situação financeira e muito mais com relatórios gerados
              automaticamente pelo sistema escolar.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-5">
            <h3>Comunicação Integrada</h3>
            <p>
              Mantenha toda a comunidade escolar conectada. Notificações
              para alunos e professores, agendamento de reuniões com
              responsáveis e comunicados gerais, tudo centralizado no
              sistema de gestão escolar.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-6">
            <h3>Segurança dos Dados</h3>
            <p>
              Seus dados são protegidos com autenticação segura e
              controle de acesso por nível de permissão. Cada escola
              tem um ambiente isolado, garantindo privacidade total
              das informações dos alunos e professores.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <h2 className="reveal">Experimente o sistema escolar gratuitamente</h2>
        <p className="reveal reveal-delay-1">
          Cadastre sua escola e comece a usar agora. Sem compromisso,
          sem necessidade de cartão de crédito.
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

      <PublicFooter />
    </div>
  )
}
