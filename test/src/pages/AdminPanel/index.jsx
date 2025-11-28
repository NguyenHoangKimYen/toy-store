import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './components'
import { Menu } from 'lucide-react'
import './AdminPanel.css'

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className='admin-panel-container'>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="admin-panel-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`admin-panel-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className='admin-panel-main'>
        {/* Mobile Menu Toggle */}
        <button 
          className="admin-mobile-menu-toggle"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>

        <div className='admin-panel-content'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
