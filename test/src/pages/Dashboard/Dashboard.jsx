import React from 'react'
import Sidebar from './Components/Sidebar'
import Main from './Components/Main'

const Dashboard = () => {
  return (
    <div className='grid gap-4'>
      <Sidebar></Sidebar>
      <Main></Main>
    </div>
  )
}

export default Dashboard
