import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/alunos', label: 'Alunos' },
  { path: '/professores', label: 'Professores' },
  { path: '/materias', label: 'Matérias' },
  { path: '/turmas', label: 'Turmas' },
  { path: '/horarios', label: 'Horários' },
  { path: '/presenca', label: 'Chamada (Presença)' },
  { path: '/relatorio-presenca', label: 'Relatório de Faltas' },
  { path: '/notas', label: 'Notas' },
  { path: '/financeiro', label: 'Financeiro' },
  { path: '/reunioes', label: 'Reuniões' },
]

export default function Sidebar() {
  const user = useAuthStore(state => state.user)
  const isAdmin = user?.role === 'admin'

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {isAdmin && (
          <NavLink
            to="/aprovar-escolas"
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            Aprovar escolas
          </NavLink>
        )}
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
