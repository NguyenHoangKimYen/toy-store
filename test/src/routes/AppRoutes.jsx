import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '../components/Layout'
import ErrorBoundary from '../components/ErrorBoundary'
import Home from '../pages/Home'
import Collection from '../pages/Collection'
import { Products, ProductDetail } from '../pages/Products'
import About from '../pages/About'
import Contact from '../pages/Contact'
import Cart from '../pages/Cart/index'
import Checkout from '../pages/Checkout'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import VerifyEmail from '../pages/VerifyEmail'
import PlaceOrder from '../pages/PlaceOrder'
import Orders from '../pages/Orders'
import OrderHistory from '../pages/OrderHistory'
import Payment from '../pages/Payment'
import Profile from '../pages/Profile'
import AdminPanel from '../pages/AdminPanel'
import Dashboard from '../pages/AdminPanel/layouts/Main'
import Users from '../pages/AdminPanel/Users'
import AdminProducts from '../pages/AdminPanel/Products'
import AdminOrders from '../pages/AdminPanel/Orders'
import DiscountCodes from '../pages/AdminPanel/DiscountCodes'
import CarouselDemo from '../pages/CarouselDemo'
import { ROUTES } from '../config/routes'
import { homeLoader, categoriesLoader } from './loaders'

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <Login />
  },
  {
    path: ROUTES.REGISTER,
    element: <Signup />
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />
  },
  
  // Admin routes with nested routing
  {
    path: ROUTES.ADMIN,
    element: <AdminPanel />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'users',
        element: <Users />
      },
      {
        path: 'products',
        element: <AdminProducts />
      },
      {
        path: 'orders',
        element: <AdminOrders />
      },
      {
        path: 'discount-codes',
        element: <DiscountCodes />
      }
    ]
  },

  // Main app routes with Layout
  {
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: ROUTES.HOME,
        element: <Home />,
        loader: homeLoader,
        errorElement: <ErrorBoundary />
      },
      {
        path: ROUTES.COLLECTION,
        element: <Collection />,
        loader: categoriesLoader,
        errorElement: <ErrorBoundary />
      },
      {
        path: ROUTES.PRODUCTS,
        element: <Products />
      },
      {
        path: ROUTES.PRODUCT_DETAIL,
        element: <ProductDetail />
      },
      {
        path: ROUTES.ABOUT,
        element: <About />
      },
      {
        path: ROUTES.CONTACT,
        element: <Contact />
      },
      {
        path: ROUTES.CART,
        element: <Cart />
      },
      {
        path: ROUTES.CHECKOUT,
        element: <Checkout />
      },
      {
        path: ROUTES.PLACE_ORDER,
        element: <PlaceOrder />
      },
      {
        path: ROUTES.PAYMENT,
        element: <Payment />
      },
      {
        path: ROUTES.ORDERS,
        element: <Orders />
      },
      {
        path: ROUTES.ORDER_HISTORY,
        element: <OrderHistory />
      },
      {
        path: ROUTES.PROFILE,
        element: <Profile />
      },
      {
        path: '/carousel-demo',
        element: <CarouselDemo />
      }
    ]
  }
])

const AppRoutes = () => {
  return (
    <RouterProvider 
      router={router}
      fallbackElement={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    />
  )
}

export default AppRoutes
