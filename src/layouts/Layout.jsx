import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from '../components/BottomNav'
import NoIndex from '../components/NoIndex'

const adminBottomNavItems = [
  { key: 'dashboard', to: '/dashboard', label: 'Início', icon: 'dashboard', end: true },
  { key: 'alunos', to: '/alunos', label: 'Alunos', icon: 'alunos', end: false },
  { key: 'turmas', to: '/turmas', label: 'Turmas', icon: 'turmas', end: false },
  { key: 'notas', to: '/notas', label: 'Notas', icon: 'notas', end: false },
  { key: 'menu', type: 'button', label: 'Mais', icon: 'menu' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout">
      <NoIndex />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
      <BottomNav items={adminBottomNavItems} onMenuClick={() => setSidebarOpen(true)} />
    </div>
  )
}
