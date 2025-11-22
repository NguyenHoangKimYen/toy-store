import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { Fragment } from 'react'
import { Toaster } from './ui/sonner'

const Layout = () => {
    return (
        <div className='min-h-screen overflow-x-hidden w-full'>
            <div className='w-full shadow-sm border-b border-gray-100'>
                <div className='px-2 sm:px-4 md:px-[5vw] lg:px-[7vw] xl:px-[9vw]'>
                    <Navbar />
                </div>
            </div>
            
            <main className='w-full relative'>
                <Outlet />
            </main>
            <Toaster />
        </div>
    )
}

export default Layout
