import { Link } from 'react-router-dom'

export default function PublicNav() {
  return (
    <nav className="landing-nav">
      <Link to="/" className="landing-nav-brand">Gestão Escolar</Link>
      <div className="landing-nav-links">
        <Link to="/sistema-escolar">O Sistema</Link>
        <Link to="/funcionalidades">Funcionalidades</Link>
        <Link to="/precos">Preços</Link>
        <Link to="/login" className="landing-nav-btn">Entrar</Link>
      </div>
    </nav>
  )
}
