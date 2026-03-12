import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import useScrollReveal from '../../../hooks/useScrollReveal'
import '../public.css'

export default function Funcionalidades() {
  const revealRef = useScrollReveal()

  return (
    <div ref={revealRef}>
      <Helmet>
        <title>Funcionalidades do Sistema de Gestão Escolar | Controle Completo da Escola</title>
        <meta name="description" content="Todas as funcionalidades do sistema de gestão escolar: controle de alunos, gestão de professores, lançamento de notas, controle de presença, gestão financeira, grade horária e relatórios." />
        <meta property="og:title" content="Funcionalidades do Sistema de Gestão Escolar | Controle Completo da Escola" />
        <meta property="og:description" content="Todas as funcionalidades do sistema de gestão escolar: controle de alunos, gestão de professores, lançamento de notas, controle de presença e gestão financeira." />
        <meta property="og:url" content="https://gestaoescolar.com.br/funcionalidades" />
        <link rel="canonical" href="https://gestaoescolar.com.br/funcionalidades" />
      </Helmet>

      <PublicNav />

      <section className="landing-hero" style={{ minHeight: '40vh' }}>
        <div className="landing-hero-inner">
          <h1 className="reveal">Funcionalidades do Sistema de Gestão Escolar</h1>
          <p className="reveal reveal-delay-1">
            Todas as ferramentas que sua escola precisa para funcionar
            com eficiência, organização e controle total.
          </p>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="reveal">Controle de Alunos</h2>
        <p className="reveal reveal-delay-1">
          Sistema para controle de alunos com todas as informações
          que sua escola precisa.
        </p>
        <div className="landing-features-grid">
          <article className="landing-feature-card reveal reveal-left reveal-delay-1">
            <h3>Cadastro Completo</h3>
            <p>
              Registre todos os dados dos alunos: informações pessoais,
              contatos de responsáveis, documentos, endereço e foto.
              Mantenha o cadastro sempre atualizado e acessível.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-scale reveal-delay-2">
            <h3>Histórico Escolar</h3>
            <p>
              Acompanhe o histórico completo de cada aluno: notas por
              disciplina, frequência, ocorrências e evolução acadêmica
              ao longo dos anos. Informações centralizadas para consulta
              rápida.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-right reveal-delay-3">
            <h3>Matrícula e Turmas</h3>
            <p>
              Gerencie matrículas, enturmação e transferências de forma
              simples. Vincule alunos a turmas, defina períodos letivos
              e acompanhe a situação de cada matrícula.
            </p>
          </article>
        </div>
      </section>

      <div className="landing-section-alt">
        <section className="landing-section">
          <h2 className="reveal">Gestão de Professores</h2>
          <p className="reveal reveal-delay-1">
            Ferramentas completas para gerenciar o corpo docente da sua escola.
          </p>
          <div className="landing-features-grid">
            <article className="landing-feature-card reveal reveal-left reveal-delay-1">
              <h3>Cadastro de Professores</h3>
              <p>
                Registre dados profissionais e pessoais de cada professor.
                Atribua disciplinas, defina carga horária e acompanhe a
                atuação de cada docente na instituição.
              </p>
            </article>
            <article className="landing-feature-card reveal reveal-scale reveal-delay-2">
              <h3>Lançamento de Notas</h3>
              <p>
                Professores lançam notas diretamente no sistema, por turma
                e disciplina. O processo é simples, rápido e elimina
                a necessidade de cadernetas e planilhas.
              </p>
            </article>
            <article className="landing-feature-card reveal reveal-right reveal-delay-3">
              <h3>Controle de Presença</h3>
              <p>
                Registro de frequência diária por turma. Professores fazem
                a chamada online e o sistema gera relatórios automáticos
                de presença e ausência dos alunos.
              </p>
            </article>
          </div>
        </section>
      </div>

      <section className="landing-section">
        <h2 className="reveal">Gestão Financeira</h2>
        <p className="reveal reveal-delay-1">
          Controle financeiro completo para manter as contas da escola
          em dia.
        </p>
        <div className="landing-features-grid">
          <article className="landing-feature-card reveal reveal-left reveal-delay-1">
            <h3>Mensalidades e Pagamentos</h3>
            <p>
              Gerencie mensalidades dos alunos, registre pagamentos,
              acompanhe inadimplência e gere relatórios financeiros
              detalhados. Controle total sobre a saúde financeira
              da escola.
            </p>
          </article>
          <article className="landing-feature-card reveal reveal-right reveal-delay-2">
            <h3>Relatórios Financeiros</h3>
            <p>
              Visualize a situação financeira da escola com gráficos
              e indicadores. Acompanhe receitas, valores em aberto
              e histórico de pagamentos por aluno ou por período.
            </p>
          </article>
        </div>
      </section>

      <div className="landing-section-alt">
        <section className="landing-section">
          <h2 className="reveal">Mais Funcionalidades</h2>
          <p className="reveal reveal-delay-1">
            Tudo o que uma escola precisa para funcionar de forma organizada.
          </p>
          <div className="landing-features-grid">
            <article className="landing-feature-card reveal reveal-scale reveal-delay-1">
              <h3>Grade Horária</h3>
              <p>
                Monte a grade horária de cada turma com facilidade.
                Atribua professores e matérias por horário e dia da
                semana. Visualize conflitos automaticamente.
              </p>
            </article>
            <article className="landing-feature-card reveal reveal-scale reveal-delay-2">
              <h3>Turmas e Matérias</h3>
              <p>
                Crie turmas, cadastre matérias e vincule tudo de forma
                integrada. Defina períodos letivos e acompanhe a
                organização pedagógica da escola.
              </p>
            </article>
            <article className="landing-feature-card reveal reveal-scale reveal-delay-3">
              <h3>Reuniões e Eventos</h3>
              <p>
                Agende reuniões com responsáveis, registre pautas e
                gerencie o calendário escolar com datas comemorativas
                e eventos importantes da instituição.
              </p>
            </article>
            <article className="landing-feature-card reveal reveal-scale reveal-delay-4">
              <h3>Dashboard Completo</h3>
              <p>
                Painel administrativo com visão geral da escola: total
                de alunos, professores, turmas, indicadores financeiros
                e gráficos de desempenho. Tudo em uma única tela.
              </p>
            </article>
          </div>
        </section>
      </div>

      <section className="landing-cta">
        <h2 className="reveal">Comece a usar todas essas funcionalidades agora</h2>
        <p className="reveal reveal-delay-1">
          Cadastre sua escola gratuitamente e tenha acesso ao sistema
          de gestão escolar mais completo.
        </p>
        <div className="landing-hero-actions reveal reveal-delay-2">
          <Link to="/cadastro" className="landing-btn landing-btn-primary">
            Cadastre-se
          </Link>
          <Link to="/precos" className="landing-btn landing-btn-secondary">
            Ver Planos e Preços
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
