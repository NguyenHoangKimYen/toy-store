import React, { useState } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import ProductGrid from './components/ProductGrid'
import ProductStats from './components/ProductStats'
import ProductDetailModal from './components/ProductDetailModal'
import { useProducts } from './hooks/useProducts'
import { LoadingSpinner, ErrorMessage } from '@/components/common'

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Custom hook handles data fetching and filtering
  const { products, stats, loading, error } = useProducts(searchQuery)

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div className='h-full flex flex-col p-6'>
      {/* Header - Fixed */}
      <div className='mb-6 flex justify-between items-start flex-shrink-0'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            Product Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage product inventory and listings
          </p>
        </div>
        <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
          <Plus className='w-4 h-4' />
          Add Product
        </button>
      </div>

      {/* Search and Filters - Fixed */}
      <div className='flex gap-4 mb-6 flex-shrink-0'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            placeholder='Search for products'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
          />
        </div>
        <button className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white'>
          <Filter className='w-4 h-4' />
          Filters
        </button>
      </div>

      {/* Stats Cards - Fixed */}
      <div className='flex-shrink-0 mb-6'>
        <ProductStats stats={stats} />
      </div>

      {/* Error State */}
      {error && (
        <div className='flex-shrink-0 mb-6'>
          <ErrorMessage 
            title='Error Loading Products'
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Product Grid - Scrollable */}
      <div className='flex-1 overflow-y-auto'>
        {loading ? (
          <LoadingSpinner message='Loading products...' />
        ) : (
          <ProductGrid 
            products={products} 
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Product Detail Modal */}
      {isModalOpen && selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  )
}

export default Products
