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
  const { user, logout } = useAuth();

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
      <div className="admin-sidebar-shell rounded-xl p-5 flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 pt-1 pb-1">
          <span className="text-xl font-semibold text-slate-800">MilkyBloom</span>
        </div>

        {/* Account */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAccountMenu((v) => !v)}
            className="flex items-center gap-2 w-full text-left rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
          >
            {user?.avatar || user?.profileImage || user?.photoURL || getDefaultAvatar(user) ? (
              <img
                src={user.avatar || user.profileImage || user.photoURL || getDefaultAvatar(user)}
                alt={user?.fullname || 'Admin'}
                className="size-9 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="size-9 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-semibold">
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
            <div className="absolute left-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white shadow-lg p-1.5 z-20">
              <button
                className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-sm text-slate-700"
                onClick={() => {
                  navigate(PUBLIC_ROUTES.PROFILE);
                  setShowAccountMenu(false);
                }}
              >
                View Profile
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-sm text-slate-700"
                onClick={() => {
                  navigate(PUBLIC_ROUTES.HOME);
                  setShowAccountMenu(false);
                }}
              >
                Go to Homepage
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-sm text-red-600 font-medium"
                onClick={() => {
                  logout();
                  setShowAccountMenu(false);
                  navigate(PUBLIC_ROUTES.LOGIN);
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <label className="w-full bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3 py-2.5 text-sm text-slate-600">
            <Search className="size-4 mr-1.5 text-slate-400" />
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
              className="w-full placeholder:text-slate-400 outline-none bg-transparent"
            />
          </label>

          {searchTerm.trim().length >= 2 && (
            <div className="absolute left-0 right-0 mt-2 rounded-lg border border-slate-200 bg-white shadow-lg z-30 max-h-72 overflow-y-auto">
              {searchLoading ? (
                <div className="px-3 py-3 text-sm text-slate-500">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="px-3 py-3 text-sm text-slate-500">No results</div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition flex items-start gap-2"
                    onClick={() => handleResultNavigate(item.route)}
                  >
                    <span className="text-[11px] font-semibold text-slate-600">{item.type}</span>
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
        <div className="flex flex-col gap-1 pt-1">
          {filteredTabs.map((tab) => (
            <button
              key={tab.route}
              onClick={() => handleTabClick(tab.route)}
              className={`flex items-center justify-start gap-2.5 w-full rounded-md px-3 py-2 text-sm transition cursor-pointer ${
                isActive(tab.route)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isActive(tab.route) ? (
                <span className="h-2 w-2 rounded-full bg-white" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-300" />
              )}
              <span className="font-medium">{tab.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
