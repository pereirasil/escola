import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import '../public.css'

export default function Funcionalidades() {
  return (
    <>
      <Helmet>
        <title>Funcionalidades do Sistema de Gestao Escolar | Controle Completo da Escola</title>
        <meta name="description" content="Todas as funcionalidades do sistema de gestao escolar: controle de alunos, gestao de professores, lancamento de notas, controle de presenca, gestao financeira, grade horaria e relatorios." />
        <meta property="og:title" content="Funcionalidades do Sistema de Gestao Escolar | Controle Completo da Escola" />
        <meta property="og:description" content="Todas as funcionalidades do sistema de gestao escolar: controle de alunos, gestao de professores, lancamento de notas, controle de presenca e gestao financeira." />
        <meta property="og:url" content="https://gestaoescolar.com.br/funcionalidades" />
        <link rel="canonical" href="https://gestaoescolar.com.br/funcionalidades" />
      </Helmet>

      <PublicNav />

      <section className="landing-hero" style={{ minHeight: '40vh' }}>
        <div className="landing-hero-inner">
          <h1>Funcionalidades do Sistema de Gestao Escolar</h1>
          <p>
            Todas as ferramentas que sua escola precisa para funcionar
            com eficiencia, organizacao e controle total.
          </p>
        </div>
      </section>

      <section className="landing-section">
        <h2>Controle de Alunos</h2>
        <p>
          Sistema para controle de alunos com todas as informacoes
          que sua escola precisa.
        </p>
        <div className="landing-features-grid">
          <article className="landing-feature-card">
            <h3>Cadastro Completo</h3>
            <p>
              Registre todos os dados dos alunos: informacoes pessoais,
              contatos de responsaveis, documentos, endereco e foto.
              Mantenha o cadastro sempre atualizado e acessivel.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>Historico Escolar</h3>
            <p>
              Acompanhe o historico completo de cada aluno: notas por
              disciplina, frequencia, ocorrencias e evolucao academica
              ao longo dos anos. Informacoes centralizadas para consulta
              rapida.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>Matricula e Turmas</h3>
            <p>
              Gerencie matriculas, enturmacao e transferencias de forma
              simples. Vincule alunos a turmas, defina periodos letivos
              e acompanhe a situacao de cada matricula.
            </p>
          </article>
        </div>
      </section>

      <div className="landing-section-alt">
        <section className="landing-section">
          <h2>Gestao de Professores</h2>
          <p>
            Ferramentas completas para gerenciar o corpo docente da sua escola.
          </p>
          <div className="landing-features-grid">
            <article className="landing-feature-card">
              <h3>Cadastro de Professores</h3>
              <p>
                Registre dados profissionais e pessoais de cada professor.
                Atribua disciplinas, defina carga horaria e acompanhe a
                atuacao de cada docente na instituicao.
              </p>
            </article>
            <article className="landing-feature-card">
              <h3>Lancamento de Notas</h3>
              <p>
                Professores lancam notas diretamente no sistema, por turma
                e disciplina. O processo e simples, rapido e elimina
                a necessidade de cadernetas e planilhas.
              </p>
            </article>
            <article className="landing-feature-card">
              <h3>Controle de Presenca</h3>
              <p>
                Registro de frequencia diario por turma. Professores fazem
                a chamada online e o sistema gera relatorios automaticos
                de presenca e ausencia dos alunos.
              </p>
            </article>
          </div>
        </section>
      </div>

      <section className="landing-section">
        <h2>Gestao Financeira</h2>
        <p>
          Controle financeiro completo para manter as contas da escola
          em dia.
        </p>
        <div className="landing-features-grid">
          <article className="landing-feature-card">
            <h3>Mensalidades e Pagamentos</h3>
            <p>
              Gerencie mensalidades dos alunos, registre pagamentos,
              acompanhe inadimplencia e gere relatorios financeiros
              detalhados. Controle total sobre a saude financeira
              da escola.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>Relatorios Financeiros</h3>
            <p>
              Visualize a situacao financeira da escola com graficos
              e indicadores. Acompanhe receitas, valores em aberto
              e historico de pagamentos por aluno ou por periodo.
            </p>
          </article>
        </div>
      </section>

      <div className="landing-section-alt">
        <section className="landing-section">
          <h2>Mais Funcionalidades</h2>
          <p>
            Tudo o que uma escola precisa para funcionar de forma organizada.
          </p>
          <div className="landing-features-grid">
            <article className="landing-feature-card">
              <h3>Grade Horaria</h3>
              <p>
                Monte a grade horaria de cada turma com facilidade.
                Atribua professores e materias por horario e dia da
                semana. Visualize conflitos automaticamente.
              </p>
            </article>
            <article className="landing-feature-card">
              <h3>Turmas e Materias</h3>
              <p>
                Crie turmas, cadastre materias e vincule tudo de forma
                integrada. Defina periodos letivos e acompanhe a
                organizacao pedagogica da escola.
              </p>
            </article>
            <article className="landing-feature-card">
              <h3>Reunioes e Eventos</h3>
              <p>
                Agende reunioes com responsaveis, registre pautas e
                gerencie o calendario escolar com datas comemorativas
                e eventos importantes da instituicao.
              </p>
            </article>
            <article className="landing-feature-card">
              <h3>Dashboard Completo</h3>
              <p>
                Painel administrativo com visao geral da escola: total
                de alunos, professores, turmas, indicadores financeiros
                e graficos de desempenho. Tudo em uma unica tela.
              </p>
            </article>
          </div>
        </section>
      </div>

      <section className="landing-cta">
        <h2>Comece a usar todas essas funcionalidades agora</h2>
        <p>
          Cadastre sua escola gratuitamente e tenha acesso ao sistema
          de gestao escolar mais completo.
        </p>
        <div className="landing-hero-actions">
          <Link to="/cadastro" className="landing-btn landing-btn-primary">
            Cadastrar Gratuitamente
          </Link>
          <Link to="/precos" className="landing-btn landing-btn-secondary">
            Ver Planos e Precos
          </Link>
        </div>
      </section>

      <PublicFooter />
    </>
  )
}
