import React from 'react'
import { Eye, Edit, Trash2, Package } from 'lucide-react'
import { formatPrice } from '@/utils/formatPrice'
import { ProductBadges } from '@/components/common'

const ProductCard = ({ product, onViewDetails }) => {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group'>
      {/* Product Image */}
      <div className='relative aspect-square overflow-hidden bg-gray-100'>
        <img
          src={product.imageUrls[0]}
          alt={product.name}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
        />
        <ProductBadges product={product} />
      </div>

      {/* Product Info */}
      <div className='p-4'>
        {/* Category */}
        <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
          {product.categoryId}
        </p>
        
        {/* Product Name */}
        <h3 className='font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 h-12'>
          {product.name}
        </h3>

        {/* Price */}
        <div className='mb-3'>
          <p className='text-lg font-bold text-blue-600 dark:text-blue-400'>
            {formatPrice(product.price)}
          </p>
          {product.originalPrice && (
            <p className='text-sm text-gray-500 line-through'>
              {formatPrice(product.originalPrice)}
            </p>
          )}
        </div>

        {/* Stock & Rating */}
        <div className='flex justify-between items-center mb-3 text-sm'>
          <div className='flex items-center gap-1'>
            <Package className='w-4 h-4 text-gray-500' />
            <span className={`${product.stockQuantity === 0 ? 'text-red-600' : 'text-gray-600'} dark:text-gray-400`}>
              Stock: {product.stockQuantity}
            </span>
          </div>
          <div className='flex items-center gap-1'>
            <span className='text-yellow-500'>⭐</span>
            <span className='text-gray-600 dark:text-gray-400'>
              {product.averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-2'>
          <button 
            onClick={() => onViewDetails(product)}
            className='flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors dark:bg-blue-900 dark:text-blue-200'
          >
            <Eye className='w-4 h-4' />
            <span className='text-sm font-medium'>View</span>
          </button>
          <button className='flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors dark:bg-green-900 dark:text-green-200'>
            <Edit className='w-4 h-4' />
          </button>
          <button className='flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors dark:bg-red-900 dark:text-red-200'>
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
