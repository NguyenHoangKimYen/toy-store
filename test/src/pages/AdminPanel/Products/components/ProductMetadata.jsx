import React from 'react'
import { Calendar } from 'lucide-react'
import { formatDate } from '@/utils/formatDate'

const ProductMetadata = ({ createdAt, updatedAt }) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
      <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <div className='flex items-center gap-2 mb-2'>
          <Calendar className='w-5 h-5 text-gray-500 dark:text-gray-400' />
          <p className='text-sm font-medium text-gray-900 dark:text-white'>Created At</p>
        </div>
        <p className='text-gray-700 dark:text-gray-300'>{formatDate(createdAt)}</p>
      </div>
      <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <div className='flex items-center gap-2 mb-2'>
          <Calendar className='w-5 h-5 text-gray-500 dark:text-gray-400' />
          <p className='text-sm font-medium text-gray-900 dark:text-white'>Updated At</p>
        </div>
        <p className='text-gray-700 dark:text-gray-300'>{formatDate(updatedAt)}</p>
      </div>
    </div>
  )
}

export default ProductMetadata
