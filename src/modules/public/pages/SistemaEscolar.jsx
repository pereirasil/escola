import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import '../public.css'

export default function SistemaEscolar() {
  return (
    <>
      <Helmet>
        <title>Sistema Escolar Online - Software de Gestao para Escolas | Gestao Escolar</title>
        <meta name="description" content="Conheca o sistema escolar online mais completo do mercado. Software de gestao para escolas com controle de alunos, professores, notas, presenca e financeiro. Automatize a administracao da sua escola." />
        <meta property="og:title" content="Sistema Escolar Online - Software de Gestao para Escolas" />
        <meta property="og:description" content="Conheca o sistema escolar online mais completo do mercado. Software de gestao para escolas com controle de alunos, professores, notas, presenca e financeiro." />
        <meta property="og:url" content="https://gestaoescolar.com.br/sistema-escolar" />
        <link rel="canonical" href="https://gestaoescolar.com.br/sistema-escolar" />
      </Helmet>

      <PublicNav />

      <section className="landing-hero" style={{ minHeight: '50vh' }}>
        <div className="landing-hero-inner">
          <h1>Sistema Escolar Online</h1>
          <p>
            Um software completo de gestao escolar pensado para facilitar
            o dia a dia de diretores, coordenadores, professores e alunos.
            Tudo na nuvem, acessivel de qualquer lugar.
          </p>
        </div>
      </section>

      <section className="landing-section">
        <h2>O que e o Sistema de Gestao Escolar?</h2>
        <p>
          Uma plataforma digital que centraliza todas as operacoes
          administrativas e pedagogicas da sua instituicao de ensino.
        </p>

        <div className="landing-features-grid">
          <article className="landing-feature-card">
            <h3>Administracao Simplificada</h3>
            <p>
              Nosso sistema de controle escolar elimina planilhas e papeis.
              Centralize dados de alunos, professores, turmas e financeiro
              em um unico painel. Reduza erros e economize tempo com
              processos automatizados de gestao escolar.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>Acesso Multiusuario</h3>
            <p>
              Cada usuario tem seu perfil com permissoes adequadas.
              Gestores acessam o painel completo, professores lancam notas
              e presenca, alunos consultam boletins e historico escolar.
              Tudo com seguranca e privacidade.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>100% Online</h3>
            <p>
              Nao precisa instalar nada. Acesse o software para escola
              de qualquer dispositivo com internet: computador, tablet ou
              celular. Dados armazenados na nuvem com backups automaticos
              e disponibilidade 24 horas.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>Relatorios Inteligentes</h3>
            <p>
              Dashboards com graficos e indicadores que ajudam na tomada
              de decisao. Acompanhe desempenho academico, frequencia,
              situacao financeira e muito mais com relatorios gerados
              automaticamente pelo sistema escolar.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>Comunicacao Integrada</h3>
            <p>
              Mantenha toda a comunidade escolar conectada. Notificacoes
              para alunos e professores, agendamento de reunioes com
              responsaveis e comunicados gerais, tudo centralizado no
              sistema de gestao escolar.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>Seguranca dos Dados</h3>
            <p>
              Seus dados sao protegidos com autenticacao segura e
              controle de acesso por nivel de permissao. Cada escola
              tem um ambiente isolado, garantindo privacidade total
              das informacoes dos alunos e professores.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <h2>Experimente o sistema escolar gratuitamente</h2>
        <p>
          Cadastre sua escola e comece a usar agora. Sem compromisso,
          sem necessidade de cartao de credito.
        </p>
        <div className="landing-hero-actions">
          <Link to="/cadastro" className="landing-btn landing-btn-primary">
            Cadastrar Minha Escola
          </Link>
          <Link to="/funcionalidades" className="landing-btn landing-btn-secondary">
            Ver Funcionalidades
          </Link>
        </div>
      </section>

      <PublicFooter />
    </>
  )
}
