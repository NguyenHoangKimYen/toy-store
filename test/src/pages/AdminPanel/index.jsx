import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Components/Sidebar'

const AdminPanel = () => {
  return (
    <div className='grid gap-4 bg-red-100 p-4 grid-cols-[250px_1fr] h-screen'>
      <Sidebar />
      <div className='bg-white rounded-lg overflow-auto'>
        <Outlet />
      </div>
    </div>
  )
}

export default AdminPanel
