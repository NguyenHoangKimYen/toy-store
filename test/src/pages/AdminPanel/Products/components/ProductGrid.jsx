import React from 'react'
import { Package } from 'lucide-react'
import ProductCard from './ProductCard'

const ProductGrid = ({ products, onViewDetails }) => {
  if (products.length === 0) {
    return (
      <div className='text-center py-12'>
        <Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          No products found
        </h3>
        <p className='text-gray-600 dark:text-gray-400'>
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {products.map((product) => (
        <ProductCard 
          key={product._id} 
          product={product}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}

export default ProductGrid
