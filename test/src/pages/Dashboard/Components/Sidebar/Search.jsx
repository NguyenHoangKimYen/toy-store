import React from 'react'

const Search = () => {
    return (
        <label className='bg-stone-200 mb-4 relative rounded flex items-center px-2 py-1.5 text-sm'>
            <svg className='size-4 mr-2' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            <input type='text' placeholder='Search' className='w-full placeholder:text-stone-400 outline-none'></input>
        </label>
    )
}

export default Search
