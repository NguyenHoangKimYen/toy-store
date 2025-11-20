import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/services/config'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

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

    const email = e.target.email.value
    const password = e.target.password.value

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Login failed")

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      // Dispatch event to update navbar
      window.dispatchEvent(new Event('userLoggedIn'))
      
      toast("Login successful!", {
        position: "top-center",
        className: "!bg-green-600 !text-white border border-green-700",
      })

      // Navigate to home after short delay
      setTimeout(() => navigate("/"), 500)

    } catch (err) {
      toast(err.message, {
        position: "top-center",
        className: "!bg-red-600 !text-white border border-red-700",
      })
    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="flex h-screen items-center justify-center ">
      <Card className="w-[450px] shadow-lg border border-gray-300 dark:border-gray-800 bg-gray-100 mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-semibold">Welcome Back</CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400">
            Please sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className='flex flex-col gap-1'>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="random123@mail.com" required />
            </div>

            <div className='flex flex-col gap-1'>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <Button type="submit" disabled={loading} className="w-full mt-2 cursor-pointer">
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button type="button" disabled={loading} className="w-full mt-2 cursor-pointer bg-gray-500">
                MOCK
              </Button>
              
            </div>
            
          </form>
        </CardContent>

        <CardFooter className="text-sm text-center text-gray-600 dark:text-gray-400 flex flex-col gap-2">
          <p>
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login
