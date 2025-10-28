import React, { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

const Login = () => {




  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const email = e.target.email.value
    const password = e.target.password.value

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Unexpected error occurred")

      console.log("User:", data)
      /////////////////////////////// localStorage.setItem("token", data.token) 
      toast("OK!", {
        position: "top-center",
        className: "!bg-green-600 !text-white border border-red-700",

      })

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

    <div className="flex mt-20 items-center justify-center ">
      <Card className="w-[450px] shadow-lg border border-gray-300 dark:border-gray-800 bg-gray-100">
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
              <Input id="email" type="email" placeholder="nigga@mail.com" required />
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
