import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function Sidebar({ open, onClose }) {
  const user = useAuthStore(state => state.user)
  const isAdmin = user?.role === 'admin'

  const linkClass = ({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')
  const handleClick = () => { if (onClose) onClose() }

  return (
    <>
      {open && <div className="sidebar-overlay sidebar-overlay-visible" onClick={onClose} />}
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={linkClass} onClick={handleClick}>Dashboard</NavLink>

          {isAdmin && (
            <>
              <div className="sidebar-section-title">Administração</div>
              <NavLink to="/aprovar-escolas" className={linkClass} onClick={handleClick}>Aprovar Escolas</NavLink>
              <NavLink to="/escolas-aprovadas" className={linkClass} onClick={handleClick}>Escolas Aprovadas</NavLink>
            </>
          )}

          <div className="sidebar-section-title">Acadêmico</div>
          <NavLink to="/alunos" className={linkClass} onClick={handleClick}>Alunos</NavLink>
          <NavLink to="/professores" className={linkClass} onClick={handleClick}>Professores</NavLink>
          <NavLink to="/materias" className={linkClass} onClick={handleClick}>Matérias</NavLink>
          <NavLink to="/turmas" className={linkClass} onClick={handleClick}>Turmas</NavLink>
          <NavLink to="/turma-steps" className={linkClass} onClick={handleClick}>Montar Turma</NavLink>
          <NavLink to="/horarios" className={linkClass} onClick={handleClick}>Horários</NavLink>

          <div className="sidebar-section-title">Avaliação</div>
          <NavLink to="/notas" className={linkClass} onClick={handleClick}>Notas</NavLink>
          <NavLink to="/presenca" className={linkClass} onClick={handleClick}>Chamada (Presença)</NavLink>
          <NavLink to="/relatorio-presenca" className={linkClass} onClick={handleClick}>Relatório de Faltas</NavLink>

          <div className="sidebar-section-title">Gestão</div>
          <NavLink to="/financeiro" className={linkClass} onClick={handleClick}>Financeiro</NavLink>
          <NavLink to="/reunioes" className={linkClass} onClick={handleClick}>Reuniões</NavLink>
          <NavLink to="/datas-comemorativas" className={linkClass} onClick={handleClick}>Datas Comemorativas</NavLink>
        </nav>
      </aside>
    </>
  )
}
