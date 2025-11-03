import React, { useState } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import ProductGrid from './components/ProductGrid'
import ProductStats from './components/ProductStats'
import ProductDetailModal from './components/ProductDetailModal'
import { useProducts } from './hooks/useProducts'

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Custom hook handles data fetching and filtering
  const { filteredProducts, stats, loading, error } = useProducts(searchQuery)

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Show loading state
  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>Loading products...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className='p-6 flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='text-red-500 text-5xl mb-4'>X</div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
            Error Loading Products
          </h3>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='mb-6 flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            Product Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage your product inventory and listings
          </p>
        </div>
        <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
          <Plus className='w-4 h-4' />
          Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className='flex gap-4 mb-6'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            placeholder='Search by name, category, or slug...'
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

      {/* Stats Cards */}
      <ProductStats stats={stats} />

      {/* Product Grid */}
      <ProductGrid 
        products={filteredProducts} 
        onViewDetails={handleViewDetails}
      />

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
