import React from 'react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export const AuthCard = ({ children, className = "w-[500px]" }) => {
  return (
    <Card className={`${className} shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl animate-in fade-in duration-500`}>
      {children}
    </Card>
  )
}

export const AuthHeader = ({ title, subtitle }) => {
  return (
    <CardHeader className="space-y-2 pb-6">
      <CardTitle className="text-3xl text-center font-bold text-white [text-shadow:_0_2px_8px_rgb(0_0_0_/_40%)]">
        {title}
      </CardTitle>
      {subtitle && (
        <CardDescription className="text-center text-white/95 [text-shadow:_0_1px_4px_rgb(0_0_0_/_30%)]">
          {subtitle}
        </CardDescription>
      )}
    </CardHeader>
  )
}

export const AuthContent = ({ children }) => {
  return <CardContent>{children}</CardContent>
}

export const AuthFooter = ({ children }) => {
  return (
    <CardFooter className="flex flex-col gap-2 pt-6 border-t border-white/20">
      {children}
    </CardFooter>
  )
}
