import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from '../components/Layout'
import Home from '../pages/Home'
import Collection from '../pages/Collection'
import { Products, ProductDetail } from '../pages/Products'
import About from '../pages/About'
import Contact from '../pages/Contact'
import Cart from '../pages/Cart/index'
import Checkout from '../pages/Checkout'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import PlaceOrder from '../pages/PlaceOrder'
import Orders from '../pages/Orders'
import OrderHistory from '../pages/OrderHistory'
import Payment from '../pages/Payment'
import Profile from '../pages/Profile'
import AdminPanel from '../pages/AdminPanel'
import Dashboard from '../pages/AdminPanel/Components/Main'
import Users from '../pages/AdminPanel/Users'
import AdminProducts from '../pages/AdminPanel/Products'
import CarouselDemo from '../pages/CarouselDemo'
import { ROUTES } from '../config/routes'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path={ROUTES.LOGIN} element={<Login/>}/>
        <Route path={ROUTES.REGISTER} element={<Signup />}></Route>
        
        {/* Admin routes with nested routing */}
        <Route path={ROUTES.ADMIN} element={<AdminPanel />}>
          <Route index element={<Dashboard />} />
          <Route path='users' element={<Users />} />
          <Route path='products' element={<AdminProducts />} />
        </Route>

        <Route element={<Layout />}>
            <Route path={ROUTES.HOME} element={<Home />}></Route>
            <Route path={ROUTES.COLLECTION} element={<Collection />}></Route>
            <Route path={ROUTES.PRODUCTS} element={<Products />}></Route>
            <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetail />}></Route>
            <Route path={ROUTES.ABOUT} element={<About />}></Route>
            <Route path={ROUTES.CONTACT} element={<Contact />}></Route>
            <Route path={ROUTES.CART} element={<Cart />}></Route>
            <Route path={ROUTES.CHECKOUT} element={<Checkout />}></Route>
            <Route path={ROUTES.PLACE_ORDER} element={<PlaceOrder />}></Route>
            <Route path={ROUTES.PAYMENT} element={<Payment />}></Route>
            <Route path={ROUTES.ORDERS} element={<Orders />}></Route>
            <Route path={ROUTES.ORDER_HISTORY} element={<OrderHistory />}></Route>
            <Route path={ROUTES.PROFILE} element={<Profile />}></Route>
            <Route path='/carousel-demo' element={<CarouselDemo />}></Route>
        </Route>
    </Routes>
  )
}

export default AppRoutes
