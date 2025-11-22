import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import authBg from '@/assets/images/auth/background.webp'

export const AuthLayout = ({ children }) => {
  const navigate = useNavigate()

  return (
    <div 
      className="flex items-center justify-center min-h-screen py-8 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-y-auto"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: '-webkit-optimize-contrast'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-purple-800/80 to-indigo-900/80"></div>
      
      {/* Back to Shop Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 group border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl"
        aria-label="Back to shop"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" />
        <span className="font-medium">Back to Shop</span>
      </button>
      
      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
