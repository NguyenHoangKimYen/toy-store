import React from 'react'
import { Star } from 'lucide-react'
import { formatPrice } from '@/utils/formatPrice'

const ProductInfo = ({ product }) => {
  return (
    <div>
      {/* Category & Badges */}
      <div className='flex items-center gap-2 mb-3'>
        <span className='px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-sm font-medium'>
          {product.categoryId}
        </span>
        {product.isNew && (
          <span className='px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-semibold'>
            NEW
          </span>
        )}
        {product.isFeatured && (
          <span className='px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-semibold'>
            FEATURED
          </span>
        )}
      </div>

      {/* Product Name */}
      <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
        {product.name}
      </h3>

      {/* Slug */}
      <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
        Slug: {product.slug}
      </p>

      {/* Price */}
      <div className='mb-4'>
        <p className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
          {formatPrice(product.price)}
        </p>
        {product.originalPrice && (
          <p className='text-lg text-gray-500 line-through'>
            {formatPrice(product.originalPrice)}
          </p>
        )}
      </div>

      {/* Rating */}
      <div className='flex items-center gap-2 mb-4'>
        <div className='flex items-center'>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= product.averageRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className='text-gray-600 dark:text-gray-400'>
          {product.averageRating.toFixed(1)} / 5.0
        </span>
      </div>

      {/* Stock & Sales Info */}
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Stock Quantity</p>
          <p className={`text-2xl font-bold ${
            product.stockQuantity === 0 
              ? 'text-red-600' 
              : 'text-green-600'
          }`}>
            {product.stockQuantity}
          </p>
        </div>
        <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Sold Count</p>
          <p className='text-2xl font-bold text-purple-600'>
            {product.soldCount}
          </p>
        </div>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className='mb-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Tags</p>
          <div className='flex flex-wrap gap-2'>
            {product.tags.map((tag) => (
              <span
                key={tag._id}
                className='px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm font-medium uppercase'
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductInfo
