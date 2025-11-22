import React from 'react'
import authBg from '@/assets/images/auth/background.webp'

export const AuthLayout = ({ children }) => {
  return (
    <div 
      className="flex items-center justify-center min-h-screen py-8 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-purple-800/70 to-indigo-900/70 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
