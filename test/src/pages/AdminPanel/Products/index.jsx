import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Filter, Package, MessageSquare } from 'lucide-react'
import ProductGrid from './components/ProductGrid'
import ProductStats from './components/ProductStats'
import ProductDetailModal from './components/ProductDetailModal'
import ProductFormModal from './components/ProductFormModal'
import ProductFilters from './components/ProductFilters'
import CommentsManagement from './components/CommentsManagement'
import { AdminContent } from '../components'
import { useProducts, useDebounce } from '@/hooks' // Using global hook
import { PageHeader, SearchBar } from '@/components/common'
import { getCategories } from '@/services/categories.service'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const [activeTab, setActiveTab] = useState('products')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 400) // Debounce search input
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
      keyword: debouncedSearch.trim() || undefined,
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
  }, [debouncedSearch, filters])


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

  // Search and filtering is now done on backend
  const products = allProducts
  
  // Helper function to calculate stock from variants or fallback to totalStock
  const getProductStock = (p) => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
    }
    return p.totalStock ?? 0;
  };
  
  // Calculate stats from ALL products (not filtered)
  const stats = useMemo(() => ({
    totalProducts: allProducts.length,
    totalStock: allProducts.reduce((sum, p) => sum + getProductStock(p), 0),
    totalSold: allProducts.reduce((sum, p) => sum + (p.totalUnitsSold || 0), 0),
    outOfStock: allProducts.filter(p => getProductStock(p) === 0).length,
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

  const headerCard = (
    <div className='admin-card bg-white/85 backdrop-blur-md border border-purple-100/70 rounded-2xl shadow-[0_18px_42px_-28px_rgba(124,58,237,0.22)] p-5 md:p-6'>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
          <div className='space-y-1'>
            <h2 className='text-2xl font-semibold text-slate-900'>Product Management</h2>
            <p className='text-sm text-slate-500'>Manage product inventory and listings</p>
          </div>
          <div className='w-full md:w-auto grid grid-cols-12 gap-3 items-center'>
            <label className='col-span-12 md:col-span-7 lg:col-span-8 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/85 border border-purple-100/80 shadow-inner backdrop-blur-sm'>
              <Search className='w-4 h-4 text-slate-400' />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search products'
                className='w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400'
              />
            </label>
            <div className='col-span-12 md:col-span-5 lg:col-span-4 flex justify-end gap-2'>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className='px-3 py-2 rounded-xl border border-purple-100/80 bg-white/80 text-slate-700 hover:bg-purple-50 transition flex items-center gap-2'
              >
                <Filter className='w-4 h-4' />
                <span>Filter</span>
              </button>
              <button 
                onClick={handleAddProduct}
                className='px-3 py-2 rounded-xl border border-purple-100/80 bg-white/80 text-slate-700 hover:bg-purple-50 transition flex items-center gap-2'
              >
                <Plus className='w-4 h-4' />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className='pt-3 border-t border-purple-100/60'>
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              categories={categories}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </div>
        )}
      </div>
    </div>
  )

  const commentsHeader = (
    <div className='admin-card bg-white/85 backdrop-blur-md border border-purple-100/70 rounded-2xl shadow-[0_18px_42px_-28px_rgba(124,58,237,0.22)] p-5 md:p-6'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-semibold text-slate-900'>Comments Management</h2>
        <p className='text-sm text-slate-500'>Moderate and manage customer comments</p>
      </div>
    </div>
  )

  return (
    <>
      <div className='space-y-4'>
        {/* Horizontal Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='bg-white/80 border border-purple-100/60 p-1 rounded-xl'>
            <TabsTrigger 
              value='products' 
              className='flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 px-4 py-2 rounded-lg transition-all'
            >
              <Package size={16} />
              Products
            </TabsTrigger>
            <TabsTrigger 
              value='comments'
              className='flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 px-4 py-2 rounded-lg transition-all'
            >
              <MessageSquare size={16} />
              Comments
            </TabsTrigger>
          </TabsList>

          {/* Products Tab Content */}
          <TabsContent value='products' className='mt-4'>
            <AdminContent
              header={headerCard}
              filters={null}
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
            </AdminContent>
          </TabsContent>

          {/* Comments Tab Content */}
          <TabsContent value='comments' className='mt-4'>
            <AdminContent header={commentsHeader}>
              <CommentsManagement />
            </AdminContent>
          </TabsContent>
        </Tabs>
      </div>

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
