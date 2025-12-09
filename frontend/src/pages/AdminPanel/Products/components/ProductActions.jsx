import React from 'react'

const ProductActions = ({ onClose }) => {
  return (
    <div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
      <button className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'>
        Edit Product
      </button>
      <button className='px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors font-medium'>
        Delete Product
      </button>
      <button 
        onClick={onClose}
        className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors font-medium'
      >
        Close
      </button>
    </div>
  )
}

export default ProductActions
