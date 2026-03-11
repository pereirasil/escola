import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

function Icon({ path, size = 16 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

const icons = {
  dashboard: 'M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-10h8V3h-8v8Z',
  approve: 'M9 12l2 2 4-4M12 22C6.5 19.5 3 15.5 3 8V5l9-3 9 3v3c0 7.5-3.5 11.5-9 14Z',
  schools: 'M4 20h16M6 20V8l6-4 6 4v12M10 12h4M10 16h4',
  students: 'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10.5 10v-2a4 4 0 0 0-3-3.87M14.5 3.13a4 4 0 0 1 0 7.75',
  teachers: 'M12 3 2 8l10 5 8-4v7M6 10v4c0 2.2 2.7 4 6 4s6-1.8 6-4v-4',
  subjects: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z',
  classes: 'M3 7.5 12 3l9 4.5-9 4.5L3 7.5Zm0 4.5 9 4.5 9-4.5M3 16.5 12 21l9-4.5',
  steps: 'M5 5h6v6H5zM13 6h6M13 10h4M5 13h6v6H5zM13 14h6M13 18h4',
  schedules: 'M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm4 8h3v3H9z',
  grades: 'M5 20V10M12 20V4M19 20v-7',
  attendance: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  report: 'M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8l-6-6Zm0 0v6h6',
  finance: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  meetings: 'M8 2v4M16 2v4M3 10h18M8 14h8M8 18h5M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z',
  events: 'M12 21c4.97-4.35 8-7.68 8-11a8 8 0 1 0-16 0c0 3.32 3.03 6.65 8 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
}

export default function Sidebar({ open, onClose }) {
  const user = useAuthStore(state => state.user)
  const isAdmin = user?.role === 'admin'

  const linkClass = ({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')
  const handleClick = () => { if (onClose) onClose() }
  const navLabel = (icon, label) => (
    <>
      <span className="sidebar-link-icon"><Icon path={icon} /></span>
      <span>{label}</span>
    </>
  )

  return (
    <>
      {open && <div className="sidebar-overlay sidebar-overlay-visible" onClick={onClose} />}
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={linkClass} onClick={handleClick}>{navLabel(icons.dashboard, 'Dashboard')}</NavLink>

          {isAdmin && (
            <>
              <div className="sidebar-section-title">Administracao</div>
              <NavLink to="/aprovar-escolas" className={linkClass} onClick={handleClick}>{navLabel(icons.approve, 'Aprovar Escolas')}</NavLink>
              <NavLink to="/escolas-aprovadas" className={linkClass} onClick={handleClick}>{navLabel(icons.schools, 'Escolas Aprovadas')}</NavLink>
            </>
          )}

          <div className="sidebar-section-title">Academico</div>
          <NavLink to="/alunos" className={linkClass} onClick={handleClick}>{navLabel(icons.students, 'Alunos')}</NavLink>
          <NavLink to="/professores" className={linkClass} onClick={handleClick}>{navLabel(icons.teachers, 'Professores')}</NavLink>
          <NavLink to="/materias" className={linkClass} onClick={handleClick}>{navLabel(icons.subjects, 'Materias')}</NavLink>
          <NavLink to="/turmas" className={linkClass} onClick={handleClick}>{navLabel(icons.classes, 'Turmas')}</NavLink>
          <NavLink to="/turma-steps" className={linkClass} onClick={handleClick}>{navLabel(icons.steps, 'Turma Steps')}</NavLink>
          <NavLink to="/horarios" className={linkClass} onClick={handleClick}>{navLabel(icons.schedules, 'Horarios')}</NavLink>

          <div className="sidebar-section-title">Avaliacao</div>
          <NavLink to="/notas" className={linkClass} onClick={handleClick}>{navLabel(icons.grades, 'Notas')}</NavLink>
          <NavLink to="/presenca" className={linkClass} onClick={handleClick}>{navLabel(icons.attendance, 'Chamada (Presenca)')}</NavLink>
          <NavLink to="/relatorio-presenca" className={linkClass} onClick={handleClick}>{navLabel(icons.report, 'Relatorio de Faltas')}</NavLink>

          <div className="sidebar-section-title">Gestao</div>
          <NavLink to="/financeiro" className={linkClass} onClick={handleClick}>{navLabel(icons.finance, 'Financeiro')}</NavLink>
          <NavLink to="/reunioes" className={linkClass} onClick={handleClick}>{navLabel(icons.meetings, 'Reunioes')}</NavLink>
          <NavLink to="/datas-comemorativas" className={linkClass} onClick={handleClick}>{navLabel(icons.events, 'Datas Comemorativas')}</NavLink>
        </nav>
      </aside>
    </>
  )
}
