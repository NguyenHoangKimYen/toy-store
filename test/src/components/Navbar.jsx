import React, { useState, useEffect } from 'react'
import { Search, ShoppingCart, User, UserCircle, Package, LogOut, Settings } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Navbar = () => {
    const navigate = useNavigate()
    const [cartCount, setCartCount] = useState(0)
    const [user, setUser] = useState(null)

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(totalItems);
        console.log('Cart count updated:', totalItems, 'from', cart.length, 'items');
    };

    const loadUser = () => {
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                setUser(JSON.parse(userData))
            } catch {
                setUser(null)
            }
        } else {
            setUser(null)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        toast('Logged out successfully', {
            position: "top-center",
            className: "!bg-green-600 !text-white border border-green-700",
        })
        navigate('/')
    }

    useEffect(() => {
        // Initial load
        updateCartCount();
        loadUser();

        // Listen for cart updates
        window.addEventListener('cartUpdated', updateCartCount);
        window.addEventListener('userLoggedIn', loadUser);

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
            window.removeEventListener('userLoggedIn', loadUser);
        };
    }, []);

    return (
        <div className='flex items-center justify-between py-5 font-medium'>
            <Link to='/' className='text-4xl'>LOGO</Link>

            <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
                <NavLink to='/' className='flex flex-col items-center gap-1'>
                    <p>HOME</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/products' className='flex flex-col items-center gap-1'>
                    <p>PRODUCTS</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/collection' className='flex flex-col items-center gap-1'>
                    <p>COLLECTION</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/about' className='flex flex-col items-center gap-1'>
                    <p>ABOUT</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/contact' className='flex flex-col items-center gap-1'>
                    <p>CONTACT</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
            </ul>

            <div className='flex items-center gap-6'>
                <Search className='w-5 cursor-pointer' />
                <div className='group relative'>
                    <User className='w-5 cursor-pointer hover:text-gray-900 transition-colors' />
                    <div className='group-hover:block z-10 hidden absolute dropdown-menu right-0 pt-4'>
                        <div className='flex flex-col w-56 py-2 bg-white border border-gray-200 rounded-lg shadow-lg'>
                            {user ? (
                                <>
                                    <div className='px-4 py-3 border-b border-gray-100'>
                                        <p className='text-sm font-semibold text-gray-900'>{user.fullname}</p>
                                        <p className='text-xs text-gray-500 mt-1'>{user.email}</p>
                                        {user.role === 'admin' && (
                                            <span className='inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-white bg-orange-500 rounded'>
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    <div className='py-1'>
                                        <Link to='/profile' className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'>
                                            <UserCircle className='w-4 h-4' />
                                            <span>My Profile</span>
                                        </Link>
                                        <Link to='/order-history' className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'>
                                            <Package className='w-4 h-4' />
                                            <span>Orders</span>
                                        </Link>
                                        <Link to='/settings' className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'>
                                            <Settings className='w-4 h-4' />
                                            <span>Settings</span>
                                        </Link>
                                    </div>
                                    <div className='border-t border-gray-100 py-1'>
                                        <button onClick={handleLogout} className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors'>
                                            <LogOut className='w-4 h-4' />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className='px-4 py-3 border-b border-gray-100'>
                                        <p className='text-sm font-semibold text-gray-900'>Welcome!</p>
                                        <p className='text-xs text-gray-500 mt-1'>Sign in to your account</p>
                                    </div>
                                    <div className='py-1'>
                                        <Link to='/login' className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'>
                                            <UserCircle className='w-4 h-4' />
                                            <span>Login</span>
                                        </Link>
                                        <Link to='/register' className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'>
                                            <User className='w-4 h-4' />
                                            <span>Sign Up</span>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <Link to='/cart' className='relative'>
                    <ShoppingCart className='w-5 cursor-pointer' />
                    {cartCount > 0 && (
                        <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
                            {cartCount}
                        </p>
                    )}
                </Link>
            </div>


        </div>
    )
}

export default Navbar
