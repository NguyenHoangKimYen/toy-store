import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { Fragment } from 'react'
import { Toaster } from './ui/sonner'

const Layout = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <div>
          <Navbar></Navbar>
        </div>
        <div className='content'>
            <Outlet></Outlet>
        </div>
    </div>
  )
}

export default Layout
