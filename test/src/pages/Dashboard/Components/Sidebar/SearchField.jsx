import React from 'react'
import { Search } from 'lucide-react'

const SearchField = () => {
    return (
        <label className='bg-stone-200 mb-4 relative rounded flex items-center px-2 py-1.5 text-sm'>
            <Search className='size-4 mr-1.5'/>
            <input type='text' placeholder='Search' className='w-full placeholder:text-stone-400 outline-none'></input>
        </label>
    )
}

export default SearchField
