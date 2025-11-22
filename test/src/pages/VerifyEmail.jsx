import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { AuthLayout } from '../components/auth/AuthLayout'
import { AuthCard, AuthHeader, AuthContent, AuthFooter } from '../components/auth/AuthCard'
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'
import { API_BASE_URL } from '@/services/config'

const VerifyEmail = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error', 'invalid'
    const [message, setMessage] = useState('')
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        const verifyEmail = async () => {
            const uid = searchParams.get('uid')
            const token = searchParams.get('token')

            // Check if parameters are present
            if (!uid || !token) {
                setStatus('invalid')
                setMessage('Invalid verification link. Please check your email and try again.')
                return
            }

            try {
                const res = await fetch(`${API_BASE_URL}/auth/verify-email?uid=${uid}&token=${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const data = await res.json()

                if (res.ok) {
                    setStatus('success')
                    setMessage(data.message || 'Your email has been successfully verified!')
                    
                    // Start countdown to redirect
                    const timer = setInterval(() => {
                        setCountdown(prev => {
                            if (prev <= 1) {
                                clearInterval(timer)
                                navigate('/login')
                                return 0
                            }
                            return prev - 1
                        })
                    }, 1000)

                    return () => clearInterval(timer)
                } else {
                    setStatus('error')
                    setMessage(data.message || 'Verification failed. The link may have expired.')
                }
            } catch (error) {
                console.error('Verification error:', error)
                setStatus('error')
                setMessage('An error occurred during verification. Please try again later.')
            }
        }

        verifyEmail()
    }, [searchParams, navigate])

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                                    <Loader2 className="w-16 h-16 text-white animate-spin" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center mb-3 [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                            Verifying Your Email
                        </h3>
                        <p className="text-white/90 text-center [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                            Please wait while we verify your email address...
                        </p>
                    </>
                )

            case 'success':
                return (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
                                    <CheckCircle2 className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center mb-3 [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                            Email Verified Successfully!
                        </h3>
                        <p className="text-white/90 text-center mb-6 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                            {message}
                        </p>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                            <p className="text-white/80 text-sm [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                                Redirecting to login in{' '}
                                <span className="font-mono font-bold text-white text-lg">{countdown}</span>{' '}
                                seconds...
                            </p>
                        </div>
                    </>
                )

            case 'error':
                return (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative p-6 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-lg">
                                    <XCircle className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center mb-3 [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                            Verification Failed
                        </h3>
                        <p className="text-white/90 text-center mb-6 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                            {message}
                        </p>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-white/80 text-sm text-center [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                                The verification link may have expired or already been used.
                                Please request a new verification email.
                            </p>
                        </div>
                    </>
                )

            case 'invalid':
                return (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative p-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full shadow-lg">
                                    <XCircle className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center mb-3 [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                            Invalid Verification Link
                        </h3>
                        <p className="text-white/90 text-center [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                            {message}
                        </p>
                    </>
                )

            default:
                return null
        }
    }

    const renderActions = () => {
        if (status === 'success') {
            return (
                <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-white/90 hover:bg-white text-gray-900 font-semibold shadow-lg border border-white/50 backdrop-blur-sm"
                    size="lg"
                >
                    Go to Login
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            )
        }

        if (status === 'error' || status === 'invalid') {
            return (
                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/register')}
                        className="w-full bg-white/90 hover:bg-white text-gray-900 font-semibold shadow-lg border border-white/50 backdrop-blur-sm"
                        size="lg"
                    >
                        Create New Account
                    </Button>
                    <Button
                        onClick={() => navigate('/login')}
                        variant="outline"
                        className="w-full bg-white/5 border-white/40 hover:bg-white/15 text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)] backdrop-blur-sm"
                        size="lg"
                    >
                        Back to Login
                    </Button>
                </div>
            )
        }

        return null
    }

    return (
        <AuthLayout>
            <AuthCard className="w-[500px]">
                <AuthContent>
                    <div className="py-4">
                        {renderContent()}
                    </div>
                </AuthContent>
                {(status === 'success' || status === 'error' || status === 'invalid') && (
                    <AuthFooter>
                        {renderActions()}
                    </AuthFooter>
                )}
            </AuthCard>
        </AuthLayout>
    )
}

export default VerifyEmail
