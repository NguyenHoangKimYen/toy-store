import React, { useState } from 'react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'


const Signup = () => {

    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const fullname = e.target.fullname.value.trim()
        const email = e.target.email.value.trim()
        const phone = e.target.phone.value.trim()
        const password = e.target.password.value.trim()

        try {
            const res = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullname, email, phone, password })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message || "Signup failed")


            toast("Account created successfully!", "success")
            setTimeout(() => navigate("/login"), 500)

        } catch (err) {
            toast(err.message || "Something went wrong", "error")
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="flex mt-5 items-center justify-center ">
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
                            <Label htmlFor="password">Full name</Label>
                            <Input id="fullname" type="text" placeholder="Nigger One" required />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="nigga@mail.com" required />
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="0123456789"
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" required />
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
