import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { House, User, Panda } from 'lucide-react'
import Account from './Account'
import TabBtns from './Tabs/TabBtns'
import SearchField from './SearchField'
import { ADMIN_ROUTES } from '../../../../config/routes'

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationTabs = [
    { 
      icon: <House />, 
      title: 'Dashboard', 
      route: ADMIN_ROUTES.DASHBOARD 
    },
    { 
      icon: <User />, 
      title: 'Users', 
      route: ADMIN_ROUTES.USERS 
    },
    { 
      icon: <Panda />, 
      title: 'Products', 
      route: ADMIN_ROUTES.PRODUCTS 
    },
  ];

  const handleTabClick = (route) => {
    navigate(route);
  };

  return (
    <div className='overflow-y-auto sticky top-4 h-full custom-scrollbar'>
      <Account />
      <SearchField />
      <TabBtns 
        tabs={navigationTabs}
        activeRoute={location.pathname}
        onTabClick={handleTabClick}
      />
    </div>
  )
}

export default Sidebar
