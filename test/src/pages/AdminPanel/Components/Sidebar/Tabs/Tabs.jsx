import React from 'react'
import Tab from './Tab'

const Tabs = ({ tabs, activeRoute, onTabClick }) => {
    return (
        <div className='mt-4'>
            {
                tabs.map((tab) => {
                    return (
                        <Tab 
                            key={tab.route} 
                            icon={tab.icon} 
                            title={tab.title} 
                            isSelected={activeRoute === tab.route} 
                            onClick={() => onTabClick(tab.route)}
                        />
                    )
                })
            }
        </div>
    )
}


export default Tabs
