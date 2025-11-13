import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Eye } from 'lucide-react'

const ProductCard = ({ product, accentColor = 'blue', isDark = false }) => {
  const navigate = useNavigate()

  const colorClasses = {
    blue: 'hover:border-blue-500',
    purple: 'hover:border-purple-500',
    pink: 'hover:border-pink-500',
    rose: 'hover:border-rose-500',
    indigo: 'hover:border-indigo-500'
  }

  const hoverClass = colorClasses[accentColor] || colorClasses.blue

  const handleClick = () => {
    navigate(`/products/${product._id}`)
  }

  const formatPrice = (price) => {
    if (typeof price === 'object' && price.$numberDecimal) {
      return `$${parseFloat(price.$numberDecimal).toFixed(2)}`
    }
    return `$${parseFloat(price).toFixed(2)}`
  }

  return (
    <div 
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent ${hoverClass} cursor-pointer`}
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.imageUrls?.[0] || '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
              BEST SELLER
            </span>
          )}
          {product.discount > 0 && (
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              // Add to cart logic
            }}
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
          </button>
          <button 
            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
          {product.categoryId || 'Uncategorized'}
        </p>
        
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[48px]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </p>
            {product.originalPrice && (
              <p className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 text-sm">⭐</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {product.averageRating?.toFixed(1) || '0.0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
