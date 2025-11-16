import React, { useState, useEffect } from 'react'
import { Search, ShoppingCart, User, UserCircle, Package, LogOut, Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

const Navbar = () => {
    const [cartCount, setCartCount] = useState(0);

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(totalItems);
        console.log('Cart count updated:', totalItems, 'from', cart.length, 'items');
    };

    useEffect(() => {
        // Initial load
        updateCartCount();

        // Listen for cart updates
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
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
                            <div className='px-4 py-3 border-b border-gray-100'>
                                <p className='text-sm font-semibold text-gray-900'>My Account</p>
                                <p className='text-xs text-gray-500 mt-1'>user@example.com</p>
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
                                <button className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors'>
                                    <LogOut className='w-4 h-4' />
                                    <span>Logout</span>
                                </button>
                            </div>
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
