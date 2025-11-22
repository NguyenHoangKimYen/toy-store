import React from 'react'
import { Star } from 'lucide-react'
import { formatPrice } from '@/utils/formatPrice'
import { parsePrice } from '@/utils/priceUtils'

const ProductInfo = ({ product }) => {
  // Extract category names safely
  const getCategoryNames = () => {
    if (!product.categoryId) return 'Uncategorized';
    if (Array.isArray(product.categoryId)) {
      return product.categoryId.map(cat => cat.name || cat).join(', ');
    }
    return product.categoryId.name || product.categoryId;
  };

  return (
    <div>
      {/* Category & Badges */}
      <div className='flex items-center gap-2 mb-3'>
        <span className='px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-sm font-medium'>
          {getCategoryNames()}
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
          {product.variants && product.variants.length > 0
            ? (() => {
                const prices = product.variants.map(v => parseFloat(v.price?.$numberDecimal || v.price || 0));
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                return minPrice === maxPrice 
                  ? formatPrice(minPrice)
                  : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
              })()
            : formatPrice(product.price || 0)}
        </p>
        {product.originalPrice && (
          <p className='text-lg text-gray-500 line-through'>
            {formatPrice(product.originalPrice?.$numberDecimal || product.originalPrice)}
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
            (product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 0) === 0 
              ? 'text-red-600' 
              : 'text-green-600'
          }`}>
            {product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 0}
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
      {product.tags && product.tags.length > 0 && (
        <div className='mb-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Tags</p>
          <div className='flex flex-wrap gap-2'>
            {product.tags.map((tag, index) => (
              <span
                key={tag._id || index}
                className='px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm font-medium uppercase'
              >
                {typeof tag === 'object' ? tag.name : tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className='mb-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold'>Product Variants ({product.variants.length})</p>
          <div className='space-y-2 max-h-64 overflow-y-auto'>
            {product.variants.map((variant, index) => {
              // Handle both object and array format for attributes
              const attributes = Array.isArray(variant.attributes)
                ? variant.attributes.reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {})
                : variant.attributes || {};
              
              return (
                <div key={variant._id || index} className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600'>
                  <div className='flex flex-wrap gap-2 mb-2'>
                    {Object.entries(attributes).map(([key, value]) => (
                      <span key={key} className='px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium'>
                        <span className='font-semibold'>{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : value}
                      </span>
                    ))}
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='font-semibold text-gray-900 dark:text-white'>
                      {formatPrice(parsePrice(variant.price))}
                    </span>
                    <span className={`${variant.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      Stock: {variant.stockQuantity || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductInfo
