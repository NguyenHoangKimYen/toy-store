import React from 'react'

const ProductBadges = ({ product }) => {
  return (
    <>
      {/* Status Badges */}
      <div className='absolute top-2 left-2 flex flex-col gap-1'>
        {product.isNew && (
          <span className='px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded'>
            NEW
          </span>
        )}
        {product.isFeatured && (
          <span className='px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded'>
            FEATURED
          </span>
        )}
        {product.stockQuantity === 0 && (
          <span className='px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded'>
            OUT OF STOCK
          </span>
        )}
      </div>
      
      {/* Tags */}
      {product.tags.length > 0 && (
        <div className='absolute top-2 right-2'>
          <span className='px-2 py-1 bg-yellow-400 text-gray-900 text-xs font-semibold rounded uppercase'>
            {product.tags[0].name}
          </span>
        </div>
      )}
    </>
  )
}

export default ProductBadges
