import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { House, User, Panda, Package, Tag, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROUTES } from '@/config/routes';

const AdminSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navigationTabs = [
    { icon: <House />, title: 'Dashboard', route: ADMIN_ROUTES.DASHBOARD },
    { icon: <User />, title: 'Users', route: ADMIN_ROUTES.USERS },
    { icon: <Panda />, title: 'Products', route: ADMIN_ROUTES.PRODUCTS },
    { icon: <Package />, title: 'Orders', route: ADMIN_ROUTES.ORDERS },
    { icon: <Tag />, title: 'Discount Codes', route: ADMIN_ROUTES.DISCOUNT_CODES },
  ];

  const handleTabClick = (route) => {
    navigate(route);
    onNavigate?.();
  };

  const isActive = (route) => location.pathname === route;

  return (
    <div className="custom-scrollbar px-2">
      <div className="admin-sidebar-shell border border-purple-100/70 rounded-2xl p-5 shadow-[0_10px_30px_-22px_rgba(124,58,237,0.18)] backdrop-blur flex flex-col gap-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-20px_rgba(124,58,237,0.2)]">
        {/* Logo */}
        <div className="flex items-center gap-2 pt-1 pb-1">
          <span className="brand-logo text-2xl leading-none">MilkyBloom</span>
        </div>

        {/* Account */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-sky-400 flex items-center justify-center text-white text-sm font-semibold">
            {user?.fullname?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="leading-tight overflow-hidden">
            <span className="text-sm font-semibold text-stone-800 block truncate">{user?.fullname || 'Admin'}</span>
            <span className="text-[11px] text-stone-500 block truncate">{user?.email || 'admin@example.com'}</span>
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="w-full bg-white/82 border border-purple-100/80 rounded-xl flex items-center px-3 py-2.5 text-sm text-stone-600 shadow-none backdrop-blur-sm">
            <Search className="size-4 mr-1.5 text-stone-500" />
            <input
              type="text"
              placeholder="Search"
              className="w-full placeholder:text-stone-400 outline-none bg-transparent"
            />
          </label>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2 pt-1">
          {navigationTabs.map((tab) => (
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
