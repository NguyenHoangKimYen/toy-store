import React from 'react'
import { TrendingUp, Package } from 'lucide-react'

const ProductStats = ({ stats }) => {
  const { totalProducts, totalStock, totalSold, outOfStock } = stats

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Total Products</p>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>{totalProducts}</p>
          </div>
          <Package className='w-8 h-8 text-blue-500' />
        </div>
      </div>
      
      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Total Stock</p>
            <p className='text-2xl font-bold text-green-600'>{totalStock}</p>
          </div>
          <TrendingUp className='w-8 h-8 text-green-500' />
        </div>
      </div>
      
      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Total Sold</p>
            <p className='text-2xl font-bold text-purple-600'>{totalSold}</p>
          </div>
          <TrendingUp className='w-8 h-8 text-purple-500' />
        </div>
      </div>
      
      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Out of Stock</p>
            <p className='text-2xl font-bold text-red-600'>{outOfStock}</p>
          </div>
          <Package className='w-8 h-8 text-red-500' />
        </div>
      </div>
    </div>
  )
}

export default ProductStats
