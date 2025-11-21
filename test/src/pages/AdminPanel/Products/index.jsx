import React, { useState, useMemo, useEffect } from 'react'
import { Plus } from 'lucide-react'
import ProductGrid from './components/ProductGrid'
import ProductStats from './components/ProductStats'
import ProductDetailModal from './components/ProductDetailModal'
import ProductFormModal from './components/ProductFormModal'
import ProductFilters from './components/ProductFilters'
import AdminLayout from '../layouts/AdminLayout'
import { useProducts } from '@/hooks' // Using global hook
import { PageHeader, SearchBar } from '@/components/common'
import { getCategories } from '@/services/categories.service'
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
  const [categories, setCategories] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    categoryId: 'all',
    isFeatured: 'all',
    minPrice: '',
    maxPrice: '',
    minRating: 'all',
    daysAgo: 'all',
    sort: 'createdAt:desc'
  })

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    fetchCategories()
  }, [])

  // Build params for API call
  const apiParams = useMemo(() => {
    const params = {
      limit: 50,
      keyword: searchQuery.trim() || undefined,
    }

    // Add filters if not 'all'
    if (filters.status !== 'all') params.status = filters.status
    else params.status = 'all' // Show all statuses for admin
    
    if (filters.categoryId !== 'all') params.categoryId = filters.categoryId
    if (filters.isFeatured !== 'all') params.isFeatured = filters.isFeatured
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    if (filters.minRating !== 'all') params.minRating = filters.minRating
    if (filters.daysAgo !== 'all') params.daysAgo = filters.daysAgo
    if (filters.sort) params.sort = filters.sort

    return params
  }, [searchQuery, filters])

  // Use global products hook with dynamic params
  const { 
    products: allProducts, 
    loading, 
    error,
    createProduct,
    updateProduct,
    deleteProduct
  } = useProducts({ 
    params: apiParams,
    dependencies: [apiParams]
  })

  // Filter products based on search (client-side for instant feedback)
  const products = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    
    const searchLower = searchQuery.toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.brand?.toLowerCase().includes(searchLower)
    );
  }, [allProducts, searchQuery])
  
  // Calculate stats from ALL products (not filtered)
  const stats = useMemo(() => ({
    totalProducts: allProducts.length,
    totalStock: allProducts.reduce((sum, p) => sum + (p.stockQuantity || 0), 0),
    totalSold: allProducts.reduce((sum, p) => sum + (p.soldCount || 0), 0),
    outOfStock: allProducts.filter(p => p.stockQuantity === 0).length,
  }), [allProducts])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      categoryId: 'all',
      isFeatured: 'all',
      minPrice: '',
      maxPrice: '',
      minRating: 'all',
      daysAgo: 'all',
      sort: 'createdAt:desc'
    })
    setSearchQuery('')
  }

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
    <>
      <AdminLayout
        header={
          <PageHeader
            title='Product Management'
            description='Manage product inventory and listings'
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
        }
        filters={
          <>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder='Search for products'
              onFilterClick={() => setShowFilters(!showFilters)}
            />
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              categories={categories}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </>
        }
        stats={<ProductStats stats={stats} />}
        loading={loading}
        error={error}
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
      </AdminLayout>

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
    </>
  )
}

export default Products
