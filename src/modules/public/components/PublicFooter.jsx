import { Link } from 'react-router-dom'

export default function PublicFooter() {
  return (
    <footer className="landing-footer">
      <p>
        Sistema de Gestao Escolar &mdash;{' '}
        <Link to="/sistema-escolar">O Sistema</Link> |{' '}
        <Link to="/funcionalidades">Funcionalidades</Link> |{' '}
        <Link to="/precos">Precos</Link> |{' '}
        <Link to="/login">Entrar</Link> |{' '}
        <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </footer>
  )
}
