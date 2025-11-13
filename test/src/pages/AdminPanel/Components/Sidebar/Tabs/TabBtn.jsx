import React from 'react'

const TabBtn = ({ isSelected, icon, title, onClick }) => {


    return (
        <button onClick = {onClick} className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow, background-color, color] cursor-pointer ${isSelected ? 'bg-white text-stone-950 shadow' : 'hover:bg-gray-200 dark:hover:bg-stone-200 bg-transparent text-stone-500 shadow-none'}`}>
            {icon}
            <span>{title}</span>
        </button>
    )
}   

export default TabBtn

