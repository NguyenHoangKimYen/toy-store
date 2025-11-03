import React from 'react'

const ProductDescription = ({ description }) => {
  return (
    <div className='mb-6'>
      <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
        Description
      </h4>
      <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>
        {description}
      </p>
    </div>
  )
}

export default ProductDescription
