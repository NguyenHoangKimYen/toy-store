import React from 'react'
import TabBtn from './TabBtn'

const TabBtns = ({ tabs, activeRoute, onTabClick }) => {
    return (
        <div className='mt-4'>
            {
                tabs.map((tab) => {
                    return (
                        <TabBtn 
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


export default TabBtns
