import React from 'react'
import { Search, Filter } from 'lucide-react'

/**
 * Reusable search bar component with optional filters
 */
const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = 'Search...',
  showFilters = true,
  onFilterClick
}) => {
  return (
    <div className='flex gap-4 mb-6 flex-shrink-0'>
      <div className='flex-1 relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
        <input
          type='text'
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
        />
      </div>
      {showFilters && (
        <button 
          onClick={onFilterClick}
          className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white'
        >
          <Filter className='w-4 h-4' />
          Filters
        </button>
      )}
    </div>
  )
}

export default SearchBar
