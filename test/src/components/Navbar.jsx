import React, { useState, useEffect } from 'react'
import { Search, ShoppingCart, User, UserCircle, Package, LogOut, Settings, X, Menu, Home, Box, Layers, Info, Phone } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import './Navbar.css'

// Navigation links configuration
const NAV_LINKS = [
    { to: '/', label: 'HOME', icon: Home },
    { to: '/products', label: 'PRODUCTS', icon: Box },
    { to: '/collection', label: 'COLLECTION', icon: Layers },
    { to: '/about', label: 'ABOUT', icon: Info },
    { to: '/contact', label: 'CONTACT', icon: Phone }
]

const USER_MENU_LINKS = [
    { to: '/profile', label: 'My Profile', icon: UserCircle },
    { to: '/order-history', label: 'Orders', icon: Package },
    { to: '/settings', label: 'Settings', icon: Settings }
]

const Navbar = () => {
    const navigate = useNavigate()
    const [cartCount, setCartCount] = useState(0)
    const [user, setUser] = useState(null)
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(totalItems);
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

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        // Always show at the very top
        if (currentScrollY < 10) {
            setIsVisible(true);
        } 
        // Hide when scrolling down (with small threshold to avoid jitter)
        else if (currentScrollY > lastScrollY + 5) {
            setIsVisible(false);
        } 
        // Show when scrolling up (even slightly)
        else if (currentScrollY < lastScrollY - 5) {
            setIsVisible(true);
        }
        
        setLastScrollY(currentScrollY);
    };

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

    const handleSearchClick = () => {
        setShowSearch(!showSearch)
        if (showSearch) {
            setSearchQuery('')
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
            setShowSearch(false)
            setSearchQuery('')
        }
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const closeMobileMenu = () => {
        setShowMobileMenu(false)
    }

    useEffect(() => {
        // Initial load
        updateCartCount();
        loadUser();

        // Listen for cart updates
        window.addEventListener('cartUpdated', updateCartCount);
        window.addEventListener('userLoggedIn', loadUser);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
            window.removeEventListener('userLoggedIn', loadUser);
            window.removeEventListener('scroll', handleScroll);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastScrollY]);

    // Render mobile menu
    const renderMobileMenu = () => (
        <div className={`mobile-menu ${showMobileMenu ? 'open' : ''}`}>
            <div className="mobile-menu-header">
                <span className="logo">LOGO</span>
                <button className="mobile-menu-close" onClick={closeMobileMenu}>
                    <X size={20} />
                </button>
            </div>
            <div className="mobile-menu-content">
                {/* User Section */}
                <div className="mobile-user-section">
                    {user ? (
                        <div className="mobile-user-info">
                            <div className="user-avatar">
                                {user.fullname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="mobile-user-details">
                                <div className="mobile-user-name">{user.fullname || user.username || 'User'}</div>
                                <div className="mobile-user-email">{user.email || ''}</div>
                                {user.role === 'admin' && (
                                    <span className="mobile-user-role">Admin</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mobile-auth-buttons">
                            <Link to="/login" className="login-btn" onClick={closeMobileMenu}>Login</Link>
                            <Link to="/register" className="signup-btn" onClick={closeMobileMenu}>Sign Up</Link>
                        </div>
                    )}
                </div>

                <div className="mobile-divider" />

                {/* Navigation Links */}
                <ul className="mobile-nav-links">
                    {/* eslint-disable-next-line no-unused-vars */}
                    {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                        <li key={to}>
                            <NavLink to={to} onClick={closeMobileMenu}>
                                <Icon size={20} />
                                {label.charAt(0) + label.slice(1).toLowerCase()}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {user && (
                    <>
                        <div className="mobile-divider" />
                        <ul className="mobile-nav-links">
                            {/* eslint-disable-next-line no-unused-vars */}
                            {USER_MENU_LINKS.map(({ to, label, icon: Icon }) => (
                                <li key={to}>
                                    <NavLink to={to} onClick={closeMobileMenu}>
                                        <Icon size={20} />
                                        {label}
                                    </NavLink>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => {
                                        handleLogout()
                                        closeMobileMenu()
                                    }}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '1rem 1.5rem',
                                        color: '#ef4444',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    <LogOut size={20} />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </>
                )}
            </div>
        </div>
    )

    // Render desktop navigation links
    const renderDesktopNav = () => (
        <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
            {NAV_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} className='flex flex-col items-center gap-1'>
                    <p>{label}</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
            ))}
        </ul>
    )

    // Render search bar
    const renderSearchBar = () => (
        showSearch ? (
            <form onSubmit={handleSearchSubmit} className='flex items-center gap-2 border border-gray-300 rounded-full px-4 py-1.5 bg-white shadow-sm'>
                <Search className='w-4 text-gray-500' />
                <input
                    type='text'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder='Search products...'
                    className='outline-none text-sm w-48 bg-transparent'
                    autoFocus
                />
                <X 
                    className='w-4 cursor-pointer text-gray-500 hover:text-gray-700' 
                    onClick={handleSearchClick}
                />
            </form>
        ) : (
            <Search className='w-5 cursor-pointer' onClick={handleSearchClick} />
        )
    )

    // Render user dropdown menu
    const renderUserMenu = () => (
        <div className='group relative'>
            <User className='w-5 cursor-pointer hover:text-gray-900 transition-colors' />
            <div className='group-hover:block z-10 hidden absolute dropdown-menu right-0 pt-4'>
                <div className='flex flex-col w-56 py-2 bg-white border border-gray-200 rounded-lg shadow-lg'>
                    {user ? (
                        <>
                            <div className='px-4 py-3 border-b border-gray-100'>
                                <p className='text-sm font-semibold text-gray-900'>{user.fullname || user.username || 'User'}</p>
                                <p className='text-xs text-gray-500 mt-1'>{user.email || ''}</p>
                                {user.role === 'admin' && (
                                    <span className='inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-white bg-orange-500 rounded'>
                                        Admin
                                    </span>
                                )}
                            </div>
                            <div className='py-1'>
                                {/* eslint-disable-next-line no-unused-vars */}
                                {USER_MENU_LINKS.map(({ to, label, icon: Icon }) => (
                                    <Link key={to} to={to} className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'>
                                        <Icon className='w-4 h-4' />
                                        <span>{label}</span>
                                    </Link>
                                ))}
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
    )

    // Render cart icon
    const renderCart = () => (
        <Link to='/cart' className='relative'>
            <ShoppingCart className='w-5 cursor-pointer' />
            {cartCount > 0 && (
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
                    {cartCount}
                </p>
            )}
        </Link>
    )

    return (
        <>
            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
            )}

            {/* Mobile Menu */}
            {renderMobileMenu()}

            {/* Main Navbar */}
            <nav className={`navbar-wrapper ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
                <div className='px-2 sm:px-4 md:px-[5vw] lg:px-[7vw] xl:px-[3vw]'>
                    <div className='flex items-center justify-between py-5 font-medium'>
                        {/* Mobile Menu Toggle */}
                        <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(true)}>
                            <Menu size={24} />
                        </button>

                        {/* Logo */}
                        <Link to='/' className='text-4xl'>LOGO</Link>

                        {/* Desktop Navigation */}
                        {renderDesktopNav()}

                        {/* Right Side Icons */}
                        <div className='flex items-center gap-6'>
                            {renderSearchBar()}
                            {renderUserMenu()}
                            {renderCart()}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar
