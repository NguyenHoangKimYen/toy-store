import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { Fragment } from 'react'
import { Toaster } from './ui/sonner'

const Layout = () => {
    return (
        <div className='overflow-x-hidden w-full relative'>
            <div className="global-animated-bg animated-gradient" aria-hidden="true" />
            <Navbar />
            
            <main className='w-full relative z-10 pt-[73px]'>
                <Outlet />
            </main>
            <Toaster />
        </div>
    )
}

export default Layout
