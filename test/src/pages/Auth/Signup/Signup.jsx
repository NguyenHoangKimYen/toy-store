import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/services/config'
import { AuthLayout } from '../common/AuthLayout'
import { AuthCard, AuthHeader, AuthContent } from '../common/AuthCard'
import { SignupForm } from './SignupForm'
import { VerificationNotice } from './VerificationNotice'

const Signup = () => {
    const [loading, setLoading] = useState(false)
    const [showVerificationNotice, setShowVerificationNotice] = useState(false)
    const [userEmail, setUserEmail] = useState('')
    const [formData, setFormData] = useState({ fullname: '', username: '', email: '', phone: '', password: '', confirmPassword: '' })
    const [validationErrors, setValidationErrors] = useState({})
    const [touchedFields, setTouchedFields] = useState({})
    const [checkingAvailability, setCheckingAvailability] = useState({})
    const navigate = useNavigate()

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            navigate('/')
        }
    }, [navigate])

    const calculatePasswordStrength = (password) => {
        let strength = 0
        const checks = {
            length: password.length >= 12,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
        }
        
        if (checks.length) strength += 25
        if (checks.uppercase) strength += 25
        if (checks.lowercase) strength += 25
        if (checks.number) strength += 25
        
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
                if (value.length < 12) errors.password = 'Password must be at least 12 characters'
                else if (value.length > 32) errors.password = 'Password must not exceed 32 characters'
                break
            case 'confirmPassword':
                if (value !== formData.password) errors.confirmPassword = 'Passwords do not match'
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

        // Check availability for username and email
        if ((name === 'username' || name === 'email') && value.length >= 3) {
            checkAvailability(name, value)
        }
    }

    const checkAvailability = async (field, value) => {
        // Clear any existing timeout for this field
        if (window[`${field}Timeout`]) {
            clearTimeout(window[`${field}Timeout`])
        }

        // Debounce the API call
        window[`${field}Timeout`] = setTimeout(async () => {
            setCheckingAvailability(prev => ({ ...prev, [field]: true }))

            try {
                const res = await fetch(`${API_BASE_URL}/users/check-${field}?${field}=${encodeURIComponent(value)}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })

                const data = await res.json()

                if (data.success && !data.available) {
                    // Field is taken
                    setValidationErrors(prev => ({
                        ...prev,
                        [field]: data.message || `This ${field} is already taken`
                    }))
                } else if (data.success && data.available) {
                    // Field is available - clear error if exists
                    setValidationErrors(prev => {
                        const updated = { ...prev }
                        delete updated[field]
                        return updated
                    })
                }
            } catch (err) {
                console.error(`Error checking ${field}:`, err)
            } finally {
                setCheckingAvailability(prev => ({ ...prev, [field]: false }))
            }
        }, 500) // Wait 500ms after user stops typing
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
            setTouchedFields({ fullname: true, username: true, email: true, phone: true, password: true, confirmPassword: true })
            toast.error('Please fix all validation errors')
            return
        }
        
        setLoading(true)

        const { fullname, username, email, phone, password } = formData

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    fullName: fullname.trim(), 
                    username: username.trim(), 
                    email: email.trim(), 
                    phone: phone.trim(), 
                    password 
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Registration failed")
            }

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
        <AuthLayout>
            {showVerificationNotice ? (
                <VerificationNotice userEmail={userEmail} />
            ) : (
                <AuthCard>
                    <AuthHeader 
                        title="Create Account" 
                        subtitle="Join thousands of happy customers" 
                    />
                    <AuthContent>
                        <SignupForm
                            formData={formData}
                            validationErrors={validationErrors}
                            touchedFields={touchedFields}
                            passwordStrength={passwordStrength}
                            loading={loading}
                            checkingAvailability={checkingAvailability}
                            onInputChange={handleInputChange}
                            onBlur={handleBlur}
                            onSubmit={handleSubmit}
                        />
                    </AuthContent>
                </AuthCard>
            )}
        </AuthLayout>
    )
}

export default Signup
