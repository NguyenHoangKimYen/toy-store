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
    <div className='overflow-y-auto sticky top-4 h-full custom-scrollbar'>
      {/* Account Section */}
      <div className='border-b mb-4 mt-2 pb-4 border-stone-300'>
        <button className='flex p-3 cursor-pointer hover:bg-stone-400 rounded-md transition-colors relative gap-2 w-full items-center'>
          <div className='size-9 rounded shrink-0 shadow bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold'>
            {user?.fullname?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className='text-start'>
            <span className='text-sm font-bold block'>{user?.fullname || 'Admin'}</span>
            <span className='text-xs block text-stone-500'>{user?.email || 'admin@example.com'}</span>
          </div>
          <svg className='size-3 ml-auto mr-2' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.70711 16.1359C5.31659 16.5264 5.31659 17.1596 5.70711 17.5501L10.5993 22.4375C11.3805 23.2179 12.6463 23.2176 13.4271 22.4369L18.3174 17.5465C18.708 17.156 18.708 16.5228 18.3174 16.1323C17.9269 15.7418 17.2937 15.7418 16.9032 16.1323L12.7176 20.3179C12.3271 20.7085 11.6939 20.7085 11.3034 20.3179L7.12132 16.1359C6.7308 15.7454 6.09763 15.7454 5.70711 16.1359Z" fill="#0F0F0F"/>
            <path d="M18.3174 7.88675C18.708 7.49623 18.708 6.86307 18.3174 6.47254L13.4252 1.58509C12.644 0.804698 11.3783 0.805008 10.5975 1.58579L5.70711 6.47615C5.31658 6.86667 5.31658 7.49984 5.70711 7.89036C6.09763 8.28089 6.7308 8.28089 7.12132 7.89036L11.307 3.70472C11.6975 3.31419 12.3307 3.31419 12.7212 3.70472L16.9032 7.88675C17.2937 8.27728 17.9269 8.27728 18.3174 7.88675Z" fill="#0F0F0F"/>
          </svg>
        </button>
      </div>

      {/* Search Field */}
      <label className='bg-stone-100 mb-4 relative rounded flex items-center px-2 py-1.5 text-sm'>
        <Search className='size-4 mr-1.5' />
        <input
          type='text'
          placeholder='Search'
          className='w-full placeholder:text-stone-400 outline-none bg-transparent'
        />
      </label>

      {/* Navigation Tabs */}
      <div className='mt-4'>
        {navigationTabs.map((tab) => (
          <button
            key={tab.route}
            onClick={() => handleTabClick(tab.route)}
            className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow, background-color, color] cursor-pointer ${
              isActive(tab.route)
                ? 'bg-white text-stone-950 shadow'
                : 'hover:bg-gray-200 dark:hover:bg-stone-200 bg-transparent text-stone-500 shadow-none'
            }`}
          >
            {tab.icon}
            <span>{tab.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
