import React, { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import ProductGrid from './components/ProductGrid'
import ProductStats from './components/ProductStats'
import ProductDetailModal from './components/ProductDetailModal'
import { useProducts } from '@/hooks'
import { PageHeader, SearchBar, ScrollableContent } from '@/components/common'

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch all products
  const { data: allProducts, loading, error } = useProducts({
    params: { search: searchQuery }
  })

  // Calculate stats from products
  const products = useMemo(() => Array.isArray(allProducts) ? allProducts : [], [allProducts])
  
  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0),
    totalSold: products.reduce((sum, p) => sum + (p.soldCount || 0), 0),
    outOfStock: products.filter(p => p.stockQuantity === 0).length,
  }), [products])

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
      {/* Header */}
      <PageHeader
        title='Product Management'
        description='Manage product inventory and listings'
        actionButton={
          <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
            <Plus className='w-4 h-4' />
            Add Product
          </button>
        }
      />

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder='Search for products'
      />

      {/* Stats Cards */}
      <div className='flex-shrink-0 mb-6'>
        <ProductStats stats={stats} />
      </div>

      {/* Product Grid */}
      <ScrollableContent
        loading={loading}
        error={error}
        loadingMessage='Loading products...'
        errorTitle='Error Loading Products'
        onRetry={() => window.location.reload()}
      >
        <ProductGrid 
          products={products} 
          onViewDetails={handleViewDetails}
        />
      </ScrollableContent>

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
