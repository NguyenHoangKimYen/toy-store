import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { Fragment } from 'react'
import { Toaster } from './ui/sonner'

const Layout = () => {
    return (
        <div className='min-h-screen flex flex-col overflow-x-hidden w-full'>
            <Navbar />
            
            <main className='flex-1 w-full relative pt-[73px] md:pt-[80px]'>
                <Outlet />
            </main>
            
            {/* Footer placeholder - add your footer component here */}
            <footer className='w-full bg-slate-900 text-white py-8 mt-auto'>
                <div className='max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='text-center text-sm text-slate-400'>
                        © 2025 MilkyBloom Toy Store. All rights reserved.
                    </div>
                </div>
            </footer>
            
            <Toaster />
        </div>
    )
}

export default Layout
