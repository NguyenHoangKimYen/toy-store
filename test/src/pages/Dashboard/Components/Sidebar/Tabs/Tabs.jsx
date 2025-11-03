import React from 'react'
import Tab from './Tab'
import { useNavigate, useLocation } from 'react-router-dom'
import { House, User, Panda, CircleEllipsis } from 'lucide-react'



const Tabs = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabData = [
        { icon: <House />, title: 'Dashboard', isSelected: true, route: '' },
        { icon: <User />, title: 'Users', isSelected: false, route: 'users' },
        { icon: <Panda />, title: 'Products', isSelected: false, route: 'products' },
    ];

    const handleClick = (route) => {
        if(route) navigate(route);
    }
    return (
        <div className=''>
            {
                tabData.map((tab) => {
                    return (
                        <Tab key={tab.title} icon={tab.icon} title={tab.title} isSelected={location.pathname === tab.route} onClick={() => handleClick(tab.route)}></Tab>
                    )
                })
            }
        </div>
    )
}


export default Tabs
