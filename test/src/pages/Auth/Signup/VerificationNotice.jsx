import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AuthCard, AuthHeader, AuthContent, AuthFooter } from '../common/AuthCard'
import { Mail, Shield } from 'lucide-react'

export const VerificationNotice = ({ userEmail }) => {
  const [countdown, setCountdown] = useState(900) // 15 minutes
  const navigate = useNavigate()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AuthCard>
      <AuthHeader title="Verify Your Email" />
      
      <AuthContent>
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
                <Mail className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          <p className="text-center text-base text-white/95 leading-relaxed [text-shadow:_0_1px_4px_rgb(0_0_0_/_30%)]">
            We've sent a verification link to<br />
            <strong className="text-white font-semibold">{userEmail}</strong>
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-white/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">1</div>
              <div>
                <p className="font-semibold text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_50%)]">Check your inbox</p>
                <p className="text-sm text-white/90 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">Open the email we just sent you</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">2</div>
              <div>
                <p className="font-semibold text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_50%)]">Click the verification link</p>
                <p className="text-sm text-white/90 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">This will activate your account</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">3</div>
              <div>
                <p className="font-semibold text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_50%)]">Start shopping!</p>
                <p className="text-sm text-white/90 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">You'll be redirected to login</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-white/70" />
            <span className="text-white/80 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
              Link expires in <span className="font-mono font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">{formatTime(countdown)}</span>
            </span>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-white/90 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">Didn't receive the email?</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)] hover:text-white hover:bg-white/10"
            >
              Resend verification email
            </Button>
          </div>
        </div>
      </AuthContent>

      <AuthFooter>
        <Button
          onClick={() => navigate('/login')}
          className="w-full bg-white/90 hover:bg-white text-gray-900 shadow-lg border border-white/50 backdrop-blur-sm"
          size="lg"
        >
          Go to Login
        </Button>
        <p className="text-xs text-center text-white/60 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
          Check your spam folder if you don't see the email
        </p>
      </AuthFooter>
    </AuthCard>
  )
}
