import React from 'react'

export const AuthLayout = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen py-8 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {children}
    </div>
  )
}
