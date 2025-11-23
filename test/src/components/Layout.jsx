import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { Fragment } from 'react'
import { Toaster } from './ui/sonner'

const Layout = () => {
    return (
        <div className='min-h-screen overflow-x-hidden w-full'>
            <Navbar />
            
            <main className='w-full relative pt-[73px]'>
                <Outlet />
            </main>
            <Toaster />
        </div>
    )
}

export default Layout
