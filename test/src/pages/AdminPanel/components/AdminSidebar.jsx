import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { House, User, Panda, Package, Tag, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROUTES, PUBLIC_ROUTES } from '@/config/routes';
import { getUsers } from '@/services/users.service';
import { getProducts } from '@/services/products.service';
import { getAllOrders } from '@/services/orders.service';
import { getDefaultAvatar } from '@/utils/defaultAvatar';

const AdminSidebar = ({ onNavigate }) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navigationTabs = [
    {title: 'Dashboard', route: ADMIN_ROUTES.DASHBOARD },
    { title: 'Users', route: ADMIN_ROUTES.USERS },
    { title: 'Products', route: ADMIN_ROUTES.PRODUCTS },
    { title: 'Orders', route: ADMIN_ROUTES.ORDERS },
    { title: 'Discount Codes', route: ADMIN_ROUTES.DISCOUNT_CODES },
  ];

  const handleTabClick = (route) => {
    navigate(route);
    onNavigate?.();
  };

  const isActive = (route) => location.pathname === route;
  const filteredTabs = navigationTabs.filter((tab) =>
    tab.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const [userRes, productRes, orderRes] = await Promise.allSettled([
          getUsers({ keyword: term, limit: 5 }),
          getProducts({ keyword: term, limit: 5, status: 'all' }),
          getAllOrders({ search: term, limit: 5 }),
        ]);

        const results = [];

        if (userRes.status === 'fulfilled') {
          (userRes.value?.users || userRes.value || []).slice(0, 5).forEach((u) => {
            results.push({
              id: u._id,
              type: 'User',
              title: u.fullname || u.fullName || u.username || 'User',
              subtitle: u.email || u.username,
              route: ADMIN_ROUTES.USERS,
            });
          });
        }

        if (productRes.status === 'fulfilled') {
          (productRes.value?.products || productRes.value || []).slice(0, 5).forEach((p) => {
            results.push({
              id: p._id,
              type: 'Product',
              title: p.name,
              subtitle: p.categoryId?.[0]?.name || p.categoryId?.name || 'Product',
              route: ADMIN_ROUTES.PRODUCTS,
            });
          });
        }

        if (orderRes.status === 'fulfilled') {
          (orderRes.value?.orders || orderRes.value || []).slice(0, 5).forEach((o) => {
            results.push({
              id: o._id,
              type: 'Order',
              title: `Order #${o._id?.slice(-8)}`,
              subtitle: o.userId?.email || o.userId?.fullName || 'Guest',
              route: ADMIN_ROUTES.ORDERS,
            });
          });
        }

        setSearchResults(results);
      } catch (err) {
        console.error('Sidebar search failed', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleResultNavigate = (route) => {
    navigate(route);
    setShowAccountMenu(false);
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <div className="custom-scrollbar px-2">
      <div className="admin-sidebar-shell border border-purple-100/70 rounded-2xl p-5 shadow-[0_10px_30px_-22px_rgba(124,58,237,0.18)] backdrop-blur flex flex-col gap-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-20px_rgba(124,58,237,0.2)]">
        {/* Logo */}
        <div className="flex items-center gap-2 pt-1 pb-1">
          <span className="brand-logo text-2xl leading-none">MilkyBloom</span>
        </div>

        {/* Account */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAccountMenu((v) => !v)}
            className="flex items-center gap-2 w-full text-left rounded-xl px-1 py-1 transition hover:bg-purple-50/70"
          >
            {user?.avatar || user?.profileImage || user?.photoURL || getDefaultAvatar(user) ? (
              <img
                src={user.avatar || user.profileImage || user.photoURL || getDefaultAvatar(user)}
                alt={user?.fullname || 'Admin'}
                className="size-9 rounded-full object-cover ring-1 ring-purple-100/70"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="size-9 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-sky-400 flex items-center justify-center text-white text-sm font-semibold">
                {user?.fullname?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
            <div className="leading-tight overflow-hidden">
              <span className="text-sm font-semibold text-stone-800 block truncate">{user?.fullname || 'Admin'}</span>
              <span className="text-[11px] text-stone-500 block truncate">{user?.email || 'admin@example.com'}</span>
            </div>
            <ChevronDown className={`size-4 text-stone-500 transition ${showAccountMenu ? 'rotate-180' : ''}`} />
          </button>

          {showAccountMenu && (
            <div className="absolute left-0 mt-2 w-44 rounded-xl border border-purple-100/70 bg-white/95 backdrop-blur shadow-[0_14px_34px_-22px_rgba(124,58,237,0.28)] p-2 z-20">
              <button
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-sm text-stone-700"
                onClick={() => {
                  navigate(PUBLIC_ROUTES.PROFILE);
                  setShowAccountMenu(false);
                }}
              >
                View Profile
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-sm text-stone-700"
                onClick={() => {
                  navigate(PUBLIC_ROUTES.LOGIN);
                  setShowAccountMenu(false);
                }}
              >
                Switch Account
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-sm text-stone-700"
                onClick={() => {
                  navigate(PUBLIC_ROUTES.HOME);
                  setShowAccountMenu(false);
                }}
              >
                Go to Homepage
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <label className="w-full bg-white/82 border border-purple-100/80 rounded-xl flex items-center px-3 py-2.5 text-sm text-stone-600 shadow-none backdrop-blur-sm">
            <Search className="size-4 mr-1.5 text-stone-500" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const firstMatch = filteredTabs[0];
                  if (firstMatch) handleTabClick(firstMatch.route);
                }
              }}
              className="w-full placeholder:text-stone-400 outline-none bg-transparent"
            />
          </label>

          {searchTerm.trim().length >= 2 && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-purple-100/80 bg-white/95 backdrop-blur shadow-[0_12px_32px_-22px_rgba(124,58,237,0.26)] z-30 max-h-72 overflow-y-auto">
              {searchLoading ? (
                <div className="px-3 py-3 text-sm text-stone-500">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="px-3 py-3 text-sm text-stone-500">No results</div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    className="w-full text-left px-3 py-2.5 hover:bg-purple-50/70 transition flex items-start gap-2 rounded-xl"
                    onClick={() => handleResultNavigate(item.route)}
                  >
                    <span className="text-[11px] font-semibold text-purple-600">{item.type}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-stone-800 truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-xs text-stone-500 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2 pt-1">
          {filteredTabs.map((tab) => (
            <button
              key={tab.route}
              onClick={() => handleTabClick(tab.route)}
              className={`flex items-center justify-start gap-2.5 w-full rounded-lg px-3 py-2 text-sm transition-[background-color,color,border,box-shadow] cursor-pointer ${
                isActive(tab.route)
                  ? 'bg-gradient-to-r from-purple-50 via-white to-sky-50 text-stone-900 border border-purple-100 shadow-[0_12px_32px_-24px_rgba(124,58,237,0.32)]'
                  : 'bg-transparent text-stone-600 hover:bg-purple-50/70 border border-transparent'
              }`}
            >
              {isActive(tab.route) ? (
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-purple-500 to-sky-400 shadow-[0_0_0_6px_rgba(124,58,237,0.12)]" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-stone-300/70" />
              )}
              <span className="text-stone-500">{tab.icon}</span>
              <span className="font-medium">{tab.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
