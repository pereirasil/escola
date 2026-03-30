import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <nav
      className={`landing-nav${menuOpen ? ' landing-nav--menu-open' : ''}`}
      aria-label="Navegação principal"
    >
      <Link to="/" className="landing-nav-brand" onClick={closeMenu}>
        Gestão Escolar
      </Link>
      <button
        type="button"
        className="landing-nav-mobile-toggle"
        aria-expanded={menuOpen}
        aria-controls="landing-nav-menu"
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setMenuOpen((o) => !o)}
      >
        {menuOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>
      <div id="landing-nav-menu" className="landing-nav-links">
        <Link to="/sistema-escolar" onClick={closeMenu}>
          O Sistema
        </Link>
        <Link to="/funcionalidades" onClick={closeMenu}>
          Funcionalidades
        </Link>
        <Link to="/precos" onClick={closeMenu}>
          Preços
        </Link>
        <Link to="/login" className="landing-nav-btn" onClick={closeMenu}>
          Entrar
        </Link>
      </div>
    </nav>
  )
}
