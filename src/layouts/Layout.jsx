import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
