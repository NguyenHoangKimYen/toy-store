import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/services/config'

const Signup = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            navigate('/')
        }
    }, [navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const fullName = e.target.fullname.value.trim()
        const username = e.target.username.value.trim()
        const email = e.target.email.value.trim()
        const phone = e.target.phone.value.trim()
        const password = e.target.password.value.trim()

        try {
            const res = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, username, email, phone, password })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message || "Signup failed")

            // Store token and user data
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))

            // Dispatch event to update navbar
            window.dispatchEvent(new Event('userLoggedIn'))

            toast("Account created successfully!", {
                position: "top-center",
                className: "!bg-green-600 !text-white border border-green-700",
            })
            setTimeout(() => navigate("/"), 500)

        } catch (err) {
            toast(err.message || "Something went wrong", {
                position: "top-center",
                className: "!bg-red-600 !text-white border border-red-700",
            })
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-[450px] shadow-lg border border-gray-300 dark:border-gray-800 bg-gray-100">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-semibold">Welcome!</CardTitle>
                    <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                        Please create an account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className='flex flex-col gap-1'>
                            <Label htmlFor="fullname">Full name</Label>
                            <Input id="fullname" type="text" placeholder="John Doe" required />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" type="text" placeholder="johndoe123" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9]+" title="Username must be alphanumeric (letters and numbers only)" />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="random123@mail.com" required />
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="0123456789"
                                pattern="[0-9]{10,15}"
                                title="Phone number must be 10-15 digits"
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" minLength={8} required />
                        </div>

                        <div className="flex flex-col gap-1 mt-4">
                            <Button type="submit" disabled={loading} className="w-full mt-2 cursor-pointer">
                                {loading ? "Signing in..." : "Sign Up"}
                            </Button>
                            <Button type="button" disabled={loading} className="w-full mt-2 cursor-pointer bg-gray-500">
                                MOCK
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="text-sm text-center text-gray-600 dark:text-gray-400 flex flex-col gap-2">
                    <Link to="#" className="hover:underline">
                        Forgot password?
                    </Link>
                    <p>
                        Already had an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div >
    )
}

export default Signup
