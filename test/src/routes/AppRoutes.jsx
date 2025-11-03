import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from '../components/Layout'
import Home from '../pages/Home'
import Collection from '../pages/Collection'
import About from '../pages/About'
import Contact from '../pages/Contact'
import Cart from '../pages/Cart'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import PlaceOrder from '../pages/PlaceOrder'
import Orders from '../pages/Orders'
import Dashboard from '../pages/Dashboard'


const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Signup />}></Route>
        <Route path='/admin' element={<Dashboard />}></Route>

        <Route element={<Layout />}>
            <Route path='/' element={<Home />}></Route>
            <Route path='/collection' element={<Collection />}></Route>
            <Route path='/about' element={<About />}></Route>
            <Route path='/contact' element={<Contact />}></Route>
            <Route path='/cart' element={<Cart />}></Route>
            <Route path='/place-order' element={<PlaceOrder />}></Route>
            <Route path='/orders' element={<Orders />}></Route>
            <Route path='/admin' element={<Dashboard />}></Route>
        </Route>
    </Routes>
  )
}

export default AppRoutes
