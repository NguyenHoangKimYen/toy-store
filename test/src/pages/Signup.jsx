import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/services/config'
import { Mail, Check, X, Eye, EyeOff, Loader2, Shield } from 'lucide-react'

const Signup = () => {
    const [loading, setLoading] = useState(false)
    const [showVerificationNotice, setShowVerificationNotice] = useState(false)
    const [userEmail, setUserEmail] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({ fullname: '', username: '', email: '', phone: '', password: '' })
    const [validationErrors, setValidationErrors] = useState({})
    const [touchedFields, setTouchedFields] = useState({})
    const [countdown, setCountdown] = useState(900) // 15 minutes
    const navigate = useNavigate()

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            navigate('/')
        }
    }, [navigate])

    // Countdown timer for verification
    useEffect(() => {
        if (showVerificationNotice && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [showVerificationNotice, countdown])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const calculatePasswordStrength = (password) => {
        let strength = 0
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        }
        
        if (checks.length) strength += 20
        if (checks.uppercase) strength += 20
        if (checks.lowercase) strength += 20
        if (checks.number) strength += 20
        if (checks.special) strength += 20
        
        return { strength, checks }
    }

    const validateField = (name, value) => {
        const errors = {}
        
        switch(name) {
            case 'fullname':
                if (value.length < 3) errors.fullname = 'Full name must be at least 3 characters'
                else if (value.length > 100) errors.fullname = 'Full name must not exceed 100 characters'
                break
            case 'username':
                if (value.length < 3) errors.username = 'Username must be at least 3 characters'
                else if (value.length > 30) errors.username = 'Username must not exceed 30 characters'
                else if (!/^[a-zA-Z0-9]+$/.test(value)) errors.username = 'Username must be alphanumeric'
                break
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Please enter a valid email'
                break
            case 'phone':
                if (!/^[0-9]{10,15}$/.test(value)) errors.phone = 'Phone must be 10-15 digits'
                break
            case 'password':
                if (value.length < 8) errors.password = 'Password must be at least 8 characters'
                else if (value.length > 32) errors.password = 'Password must not exceed 32 characters'
                break
            default:
                break
        }
        
        return errors
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        
        if (touchedFields[name]) {
            const errors = validateField(name, value)
            setValidationErrors(prev => ({ ...prev, ...errors }))
            if (!errors[name]) {
                setValidationErrors(prev => {
                    const updated = { ...prev }
                    delete updated[name]
                    return updated
                })
            }
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        setTouchedFields(prev => ({ ...prev, [name]: true }))
        const errors = validateField(name, value)
        setValidationErrors(prev => ({ ...prev, ...errors }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Validate all fields
        const allErrors = {}
        Object.keys(formData).forEach(key => {
            const errors = validateField(key, formData[key])
            Object.assign(allErrors, errors)
        })
        
        if (Object.keys(allErrors).length > 0) {
            setValidationErrors(allErrors)
            setTouchedFields({ fullname: true, username: true, email: true, phone: true, password: true })
            toast.error('Please fix all validation errors')
            return
        }
        
        setLoading(true)

        const { fullname, username, email, phone, password } = formData

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName: fullname, username, email, phone, password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Registration failed")
            }

            // Backend returns { message, user } - no token yet (email verification required)
            setUserEmail(email)
            setShowVerificationNotice(true)

            toast.success(data.message || "Registration successful! Please check your email.", {
                position: "top-center",
                duration: 5000,
            })

        } catch (err) {
            toast.error(err.message || "Something went wrong", {
                position: "top-center",
            })
        } finally {
            setLoading(false)
        }
    }



    const passwordStrength = formData.password ? calculatePasswordStrength(formData.password) : null

    return (
        <div className="flex items-center justify-center min-h-screen py-8 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
            {showVerificationNotice ? (
                <Card className="w-[500px] shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl animate-in fade-in duration-500">
                    <CardHeader className="space-y-4 pb-8">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
                                    <Mail className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </div>
                        <CardTitle className="text-3xl text-center font-bold text-white [text-shadow:_0_2px_8px_rgb(0_0_0_/_40%)]">
                            Verify Your Email
                        </CardTitle>
                        <CardDescription className="text-center text-base text-white/95 leading-relaxed [text-shadow:_0_1px_4px_rgb(0_0_0_/_30%)]">
                            We've sent a verification link to<br />
                            <strong className="text-white font-semibold">{userEmail}</strong>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
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
                            <span className="text-white/80">
                                Link expires in <span className="font-mono font-semibold text-white">{formatTime(countdown)}</span>
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
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pt-6">
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full bg-white/90 hover:bg-white text-gray-900 shadow-lg border border-white/50 backdrop-blur-sm"
                            size="lg"
                        >
                            Go to Login
                        </Button>
                        <p className="text-xs text-center text-white/60">
                            Check your spam folder if you don't see the email
                        </p>
                    </CardFooter>
                </Card>
            ) : (
                <Card className="w-[550px] shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl animate-in fade-in duration-500">
                    <CardHeader className="space-y-2 pb-6">
                        <CardTitle className="text-3xl text-center font-bold text-white [text-shadow:_0_2px_8px_rgb(0_0_0_/_40%)]">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-center text-white/95 [text-shadow:_0_1px_4px_rgb(0_0_0_/_30%)]">
                            Join thousands of happy customers
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Full Name */}
                            <div className='space-y-2'>
                                <Label htmlFor="fullname" className="text-sm font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">Full Name</Label>
                                <div className="relative">
                                    <Input
                                        id="fullname"
                                        name="fullname"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.fullname}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`pr-10 transition-all bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 ${
                                            touchedFields.fullname
                                                ? validationErrors.fullname
                                                    ? 'border-red-400 focus:ring-red-400'
                                                    : 'border-green-400 focus:ring-green-400'
                                                : ''
                                        }`}
                                        required
                                    />
                                    {touchedFields.fullname && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {validationErrors.fullname ? (
                                                <X className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <Check className="w-5 h-5 text-green-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {touchedFields.fullname && validationErrors.fullname && (
                                    <p className="text-xs text-red-300 flex items-center gap-1 animate-in slide-in-from-top-1">
                                        <X className="w-3 h-3" />
                                        {validationErrors.fullname}
                                    </p>
                                )}
                            </div>

                            {/* Username */}
                            <div className='space-y-2'>
                                <Label htmlFor="username" className="text-sm font-semibold text-white/90">Username</Label>
                                <div className="relative">
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="johndoe123"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`pr-10 transition-all bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 ${
                                            touchedFields.username
                                                ? validationErrors.username
                                                    ? 'border-red-400 focus:ring-red-400'
                                                    : 'border-green-400 focus:ring-green-400'
                                                : ''
                                        }`}
                                        required
                                    />
                                    {touchedFields.username && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {validationErrors.username ? (
                                                <X className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <Check className="w-5 h-5 text-green-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {touchedFields.username && validationErrors.username && (
                                    <p className="text-xs text-red-300 flex items-center gap-1 animate-in slide-in-from-top-1">
                                        <X className="w-3 h-3" />
                                        {validationErrors.username}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className='space-y-2'>
                                <Label htmlFor="email" className="text-sm font-semibold text-white/90">Email Address</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`pr-10 transition-all bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 ${
                                            touchedFields.email
                                                ? validationErrors.email
                                                    ? 'border-red-400 focus:ring-red-400'
                                                    : 'border-green-400 focus:ring-green-400'
                                                : ''
                                        }`}
                                        required
                                    />
                                    {touchedFields.email && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {validationErrors.email ? (
                                                <X className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <Check className="w-5 h-5 text-green-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {touchedFields.email && validationErrors.email && (
                                    <p className="text-xs text-red-300 flex items-center gap-1 animate-in slide-in-from-top-1">
                                        <X className="w-3 h-3" />
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-semibold text-white/90">Phone Number</Label>
                                <div className="relative">
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="0123456789"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`pr-10 transition-all bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 ${
                                            touchedFields.phone
                                                ? validationErrors.phone
                                                    ? 'border-red-400 focus:ring-red-400'
                                                    : 'border-green-400 focus:ring-green-400'
                                                : ''
                                        }`}
                                        required
                                    />
                                    {touchedFields.phone && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {validationErrors.phone ? (
                                                <X className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <Check className="w-5 h-5 text-green-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {touchedFields.phone && validationErrors.phone && (
                                    <p className="text-xs text-red-300 flex items-center gap-1 animate-in slide-in-from-top-1">
                                        <X className="w-3 h-3" />
                                        {validationErrors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Password with Strength Meter */}
                            <div className='space-y-2'>
                                <Label htmlFor="password" className="text-sm font-semibold text-white/90">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`pr-10 transition-all bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 ${
                                            touchedFields.password
                                                ? validationErrors.password
                                                    ? 'border-red-400 focus:ring-red-400'
                                                    : 'border-green-400 focus:ring-green-400'
                                                : ''
                                        }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                
                                {/* Password Strength Meter */}
                                {formData.password && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                        i < (passwordStrength.strength / 20)
                                                            ? passwordStrength.strength < 40
                                                                ? 'bg-red-500'
                                                                : passwordStrength.strength < 80
                                                                ? 'bg-orange-500'
                                                                : 'bg-green-500'
                                                            : 'bg-gray-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-semibold ${
                                            passwordStrength.strength < 40 ? 'text-red-300' :
                                            passwordStrength.strength < 80 ? 'text-orange-300' :
                                            'text-green-300'
                                        }`}>
                                            {passwordStrength.strength < 40 ? 'Weak password' :
                                             passwordStrength.strength < 80 ? 'Medium password' :
                                             'Strong password'}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-300' : 'text-white/40'}`}>
                                                {passwordStrength.checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                8+ characters
                                            </div>
                                            <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-300' : 'text-white/40'}`}>
                                                {passwordStrength.checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                Uppercase letter
                                            </div>
                                            <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-green-300' : 'text-white/40'}`}>
                                                {passwordStrength.checks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                Lowercase letter
                                            </div>
                                            <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-green-300' : 'text-white/40'}`}>
                                                {passwordStrength.checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                Number
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {touchedFields.password && validationErrors.password && (
                                    <p className="text-xs text-red-300 flex items-center gap-1 animate-in slide-in-from-top-1">
                                        <X className="w-3 h-3" />
                                        {validationErrors.password}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-white/90 hover:bg-white text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all border border-white/50 backdrop-blur-sm"
                                    size="lg"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating account...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </div>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/20" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white/10 backdrop-blur-sm px-3 text-white/70 font-semibold">Or continue with</span>
                                </div>
                            </div>

                            {/* OAuth Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 bg-white/5 border-white/40 hover:bg-white/15 text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)] backdrop-blur-sm transition-all"
                                    onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="ml-2 font-medium">Google</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 bg-white/5 border-white/40 hover:bg-white/15 text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)] backdrop-blur-sm transition-all"
                                    onClick={() => window.location.href = `${API_BASE_URL}/auth/facebook`}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span className="ml-2 font-medium">Facebook</span>
                                </Button>
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2 pt-6 border-t border-white/20">
                        <p className="text-sm text-center text-white/80">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-white hover:underline">
                                Sign in
                            </Link>
                        </p>
                        <p className="text-xs text-center text-white/60">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}

export default Signup
