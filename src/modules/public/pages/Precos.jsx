import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import '../public.css'

export default function Precos() {
  return (
    <>
      <Helmet>
        <title>Precos e Planos - Sistema de Gestao Escolar | Comece Gratuitamente</title>
        <meta name="description" content="Conheca os planos e precos do sistema de gestao escolar. Comece gratuitamente e escolha o plano ideal para sua escola. Software para escola com funcionalidades completas." />
        <meta property="og:title" content="Precos e Planos - Sistema de Gestao Escolar | Comece Gratuitamente" />
        <meta property="og:description" content="Conheca os planos e precos do sistema de gestao escolar. Comece gratuitamente e escolha o plano ideal para sua escola." />
        <meta property="og:url" content="https://gestaoescolar.com.br/precos" />
        <link rel="canonical" href="https://gestaoescolar.com.br/precos" />
      </Helmet>

      <PublicNav />

      <section className="landing-hero" style={{ minHeight: '40vh' }}>
        <div className="landing-hero-inner">
          <h1>Planos e Precos</h1>
          <p>
            Escolha o plano ideal para sua escola. Comece gratuitamente
            e escale conforme a necessidade da sua instituicao.
          </p>
        </div>
      </section>

      <section className="landing-section">
        <h2>Planos para todos os tamanhos de escola</h2>
        <p>
          Do ensino infantil ao medio, temos o plano certo para a
          sua instituicao de ensino.
        </p>

        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <h3>Gratuito</h3>
            <div className="landing-pricing-price">
              R$ 0 <small>/mes</small>
            </div>
            <ul className="landing-pricing-features">
              <li>Ate 50 alunos</li>
              <li>Cadastro de professores</li>
              <li>Controle de turmas e materias</li>
              <li>Lancamento de notas</li>
              <li>Controle de presenca</li>
              <li>Dashboard basico</li>
            </ul>
            <Link to="/cadastro" className="landing-btn landing-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Comecar Gratis
            </Link>
          </div>

          <div className="landing-pricing-card featured">
            <span className="landing-pricing-badge">Mais Popular</span>
            <h3>Profissional</h3>
            <div className="landing-pricing-price">
              R$ 99 <small>/mes</small>
            </div>
            <ul className="landing-pricing-features">
              <li>Ate 500 alunos</li>
              <li>Todas as funcionalidades do Gratuito</li>
              <li>Gestao financeira completa</li>
              <li>Grade horaria automatizada</li>
              <li>Relatorios avancados</li>
              <li>Reunioes e calendario escolar</li>
              <li>Suporte por e-mail</li>
            </ul>
            <Link to="/cadastro" className="landing-btn landing-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Comecar Agora
            </Link>
          </div>

          <div className="landing-pricing-card">
            <h3>Institucional</h3>
            <div className="landing-pricing-price">
              R$ 249 <small>/mes</small>
            </div>
            <ul className="landing-pricing-features">
              <li>Alunos ilimitados</li>
              <li>Todas as funcionalidades do Profissional</li>
              <li>Multiplas unidades escolares</li>
              <li>API de integracao</li>
              <li>Relatorios personalizados</li>
              <li>Suporte prioritario</li>
              <li>Treinamento da equipe</li>
            </ul>
            <Link to="/cadastro" className="landing-btn landing-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Falar com Vendas
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>Perguntas Frequentes</h2>
        <div className="landing-features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <article className="landing-feature-card">
            <h3>Preciso instalar algum software?</h3>
            <p>
              Nao. O sistema de gestao escolar e 100% online. Basta
              acessar pelo navegador de qualquer computador, tablet
              ou celular. Nenhuma instalacao necessaria.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>Posso migrar de plano depois?</h3>
            <p>
              Sim. Voce pode comecar com o plano gratuito e fazer
              upgrade a qualquer momento conforme sua escola crescer.
              A migracao e simples e sem perda de dados.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>Meus dados estao seguros?</h3>
            <p>
              Sim. Utilizamos criptografia, backups automaticos e
              controle de acesso por permissao. Cada escola tem um
              ambiente isolado com total privacidade.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3>Quanto tempo leva para comecar?</h3>
            <p>
              Poucos minutos. Cadastre sua escola, adicione professores
              e alunos, e o sistema ja esta pronto para uso. Oferecemos
              um processo de configuracao guiado.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <h2>Pronto para comecar?</h2>
        <p>
          Cadastre-se gratuitamente e descubra como o sistema de gestao
          escolar pode transformar a administracao da sua escola.
        </p>
        <div className="landing-hero-actions">
          <Link to="/cadastro" className="landing-btn landing-btn-primary">
            Cadastrar Gratuitamente
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
