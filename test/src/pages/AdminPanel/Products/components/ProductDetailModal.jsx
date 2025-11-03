import React from 'react'
import { X } from 'lucide-react'
import ProductImageGallery from './ProductImageGallery'
import ProductInfo from './ProductInfo'
import ProductDescription from './ProductDescription'
import ProductMetadata from './ProductMetadata'
import ProductActions from './ProductActions'

const ProductDetailModal = ({ product, onClose }) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Product Details</h2>
          <button 
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            {/* Image Gallery */}
            <ProductImageGallery images={product.imageUrls} productName={product.name} />
            
            {/* Product Info */}
            <ProductInfo product={product} />
          </div>

          {/* Description */}
          <ProductDescription description={product.description} />

          {/* Metadata */}
          <ProductMetadata createdAt={product.createdAt} updatedAt={product.updatedAt} />

          {/* Action Buttons */}
          <ProductActions onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
