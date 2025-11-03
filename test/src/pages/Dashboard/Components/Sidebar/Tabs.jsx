import React from 'react'
import { House, } from 'lucide-react'

const Tab = ({ isSelected, icon, title }) => {


    return (
        <button className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow, background-color, color] ${isSelected ? 'bg-white text-stone-950 shadow' : 'hover:bg-gray-200 dark:hover:bg-stone-200 bg-transparent text-stone-500 shadow-none'}`}>
            {icon}
            <span>{title}</span>
        </button>
    )
}

const Tabs = () => {
    return (
        <div className=''>
            <Tab icon={<House />} title='Dashboard' isSelected={true}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
            <Tab icon={<House />} title='Placeholder' isSelected={false}/>
        </div>
    )
}


export default Tabs
