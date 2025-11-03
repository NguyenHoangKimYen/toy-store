import React from 'react'
import Sidebar from './Components/Sidebar/Sidebar'
import Main from './Components/Sidebar/Main'

const Dashboard = () => {
  return (
    <div className='grid gap-4 bg-red-100 p-4 grid-cols-[250px_1fr] h-screen'>
      <Sidebar></Sidebar>
      <Main></Main>
    </div>
  )
}

export default Dashboard
