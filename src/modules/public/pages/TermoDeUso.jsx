import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import '../public.css'

export default function TermoDeUso() {
  return (
    <div>
      <Helmet>
        <title>Termo de Uso - Sistema de Gestão Escolar</title>
        <meta name="description" content="Termos de uso da plataforma de gestão escolar. Leia as condições de uso do sistema." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://gestaoescolar.com.br/termo-de-uso" />
      </Helmet>

      <header>
        <PublicNav />
      </header>

      <main>
        <section className="landing-section" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>TERMO DE USO</h1>
            <p className="termo-de-uso-date">
              Última atualização: 2026
            </p>
            <p className="termo-de-uso-date">
              Responsável: Anderson Pereira da Silva | CNPJ: 64.304.607/0001-48
            </p>

            <div className="termo-de-uso-content">
              <h2 className="termo-de-uso-h2">1. ACEITAÇÃO DOS TERMOS</h2>
              <p>
                Ao acessar ou utilizar esta plataforma, o usuário declara que leu, compreendeu e concorda com os presentes Termos de Uso. Caso não concorde com qualquer condição aqui estabelecida, o usuário não deverá utilizar o sistema.
              </p>

              <h2 className="termo-de-uso-h2">2. DESCRIÇÃO DO SERVIÇO</h2>
              <p>
                A plataforma oferece ferramentas digitais destinadas à gestão e organização de informações relacionadas ao ambiente escolar, permitindo o gerenciamento de alunos, turmas, registros acadêmicos e outras funcionalidades administrativas.
              </p>
              <p>
                A plataforma poderá ser atualizada, modificada ou aprimorada a qualquer momento, visando a melhoria contínua do serviço.
              </p>

              <h2 className="termo-de-uso-h2">3. CADASTRO DO USUÁRIO</h2>
              <p>
                Para acessar determinadas funcionalidades do sistema, poderá ser necessário realizar um cadastro, fornecendo informações verdadeiras, completas e atualizadas.
              </p>
              <p>
                O usuário é responsável por manter a confidencialidade de seus dados de acesso, incluindo login e senha, sendo também responsável por todas as atividades realizadas em sua conta.
              </p>

              <h2 className="termo-de-uso-h2">4. USO ADEQUADO DA PLATAFORMA</h2>
              <p>
                O usuário compromete-se a utilizar a plataforma de forma ética e legal, respeitando a legislação vigente.
              </p>
              <p>É proibido:</p>
              <ul className="termo-de-uso-ul">
                <li>utilizar a plataforma para atividades ilegais</li>
                <li>tentar acessar áreas restritas sem autorização</li>
                <li>realizar qualquer ação que comprometa a segurança do sistema</li>
                <li>utilizar o sistema para distribuição de conteúdo fraudulento, ofensivo ou ilícito</li>
              </ul>

              <h2 className="termo-de-uso-h2">5. DISPONIBILIDADE DO SERVIÇO</h2>
              <p>
                A plataforma busca manter seus serviços disponíveis continuamente. No entanto, poderão ocorrer interrupções temporárias devido a manutenções, atualizações técnicas ou fatores externos fora do controle da plataforma.
              </p>

              <h2 className="termo-de-uso-h2">6. PROPRIEDADE INTELECTUAL</h2>
              <p>
                Todos os direitos relacionados à plataforma, incluindo seu código, design, funcionalidades e conteúdo, são protegidos pela legislação de propriedade intelectual.
              </p>
              <p>
                É proibida a reprodução, modificação ou distribuição do sistema sem autorização.
              </p>

              <h2 className="termo-de-uso-h2">7. LIMITAÇÃO DE RESPONSABILIDADE</h2>
              <p>
                A plataforma não se responsabiliza por danos decorrentes do uso inadequado do sistema, falhas de conexão com a internet ou problemas técnicos que estejam fora de seu controle.
              </p>

              <h2 className="termo-de-uso-h2">8. ALTERAÇÕES NOS TERMOS</h2>
              <p>
                Estes Termos de Uso poderão ser atualizados ou modificados a qualquer momento. A versão mais recente estará sempre disponível na plataforma.
              </p>
              <p>
                O uso contínuo do sistema após alterações implica na aceitação dos novos termos.
              </p>

              <h2 className="termo-de-uso-h2">9. CONTATO</h2>
              <p>
                Em caso de dúvidas sobre estes Termos de Uso, o usuário poderá entrar em contato através dos canais de suporte disponibilizados na plataforma.
              </p>
            </div>

            <p style={{ marginTop: '2rem' }}>
              <Link to="/cadastro" style={{ color: '#646cff', textDecoration: 'none' }}>Voltar ao cadastro</Link>
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
