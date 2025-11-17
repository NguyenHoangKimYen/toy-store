import React, { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import ProductGrid from './components/ProductGrid'
import ProductStats from './components/ProductStats'
import ProductDetailModal from './components/ProductDetailModal'
import ProductFormModal from './components/ProductFormModal'
import { useAdminProducts } from '@/hooks'
import { PageHeader, SearchBar, ScrollableContent } from '@/components/common'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  // Use admin products hook with mock/real API toggle
  const { 
    products: allProducts, 
    loading, 
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    useMockData
  } = useAdminProducts()

  // Filter products based on search
  const products = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    
    const searchLower = searchQuery.toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.brand?.toLowerCase().includes(searchLower)
    );
  }, [allProducts, searchQuery])
  
  // Calculate stats from products
  const stats = useMemo(() => ({
    totalProducts: allProducts.length,
    totalStock: allProducts.reduce((sum, p) => sum + (p.stockQuantity || 0), 0),
    totalSold: allProducts.reduce((sum, p) => sum + (p.soldCount || 0), 0),
    outOfStock: allProducts.filter(p => p.stockQuantity === 0).length,
  }), [allProducts])

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedProduct(null)
  }

  const handleAddProduct = () => {
    setFormMode('create')
    setSelectedProduct(null)
    setIsFormModalOpen(true)
  }

  const handleEditProduct = async (productId, updatedData) => {
    await updateProduct(productId, updatedData)
  }

  const handleDeleteProduct = async (productId) => {
    const product = allProducts.find(p => p._id === productId);
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete._id);
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  const handleSaveProduct = async (productData) => {
    if (formMode === 'create') {
      await createProduct(productData)
    } else {
      await updateProduct(selectedProduct._id, productData)
    }
    setIsFormModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div className='h-full flex flex-col p-6'>
      {/* Header */}
      <PageHeader
        title='Product Management'
        description={`Manage product inventory and listings ${useMockData ? '(Using Mock Data)' : '(Connected to API)'}`}
        actionButton={
          <button 
            onClick={handleAddProduct}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
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
          onEdit={(product) => {
            setSelectedProduct(product);
            setFormMode('edit');
            setIsFormModalOpen(true);
          }}
          onDelete={handleDeleteProduct}
        />
      </ScrollableContent>

      {/* Product Detail Modal */}
      {isDetailModalOpen && selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={handleCloseDetailModal}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      )}

      {/* Product Form Modal (Add/Edit) */}
      <ProductFormModal
        product={selectedProduct}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className='bg-red-600 hover:bg-red-700'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Products
