import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { Fragment } from 'react'
import { Toaster } from './ui/sonner'

const Layout = () => {
    return (
        <div className='min-h-screen overflow-x-hidden w-full'>
            <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
                <Navbar />
            </div>
            <main className='w-full'>
                <Outlet />
            </main>
            <Toaster />
        </div>
    )
}

export default Layout
