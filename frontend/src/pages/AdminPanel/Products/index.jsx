import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Filter, Package, MessageSquare, Star, Layers } from 'lucide-react'
import ProductGrid from './components/ProductGrid'
import ProductStats from './components/ProductStats'
import ProductDetailModal from './components/ProductDetailModal'
import ProductFormModal from './components/ProductFormModal'
import ProductFilters from './components/ProductFilters'
import CommentsManagement from './components/CommentsManagement'
import ReviewsManagement from './components/ReviewsManagement'
import CategoriesManagement from './components/CategoriesManagement'
import { AdminContent, AdminHeader } from '../components'
import { useProducts, useDebounce } from '@/hooks' // Using global hook
import { PageHeader, SearchBar, Pagination } from '@/components/common'
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

const ITEMS_PER_PAGE = 12;

const Products = () => {
  const [activeTab, setActiveTab] = useState('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [commentsSearchQuery, setCommentsSearchQuery] = useState('')
  const [reviewsSearchQuery, setReviewsSearchQuery] = useState('')
  const [categoriesSearchQuery, setCategoriesSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 500) // Debounce search input
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [categories, setCategories] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE)
  
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
      page: currentPage,
      limit: pageSize,
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
  }, [debouncedSearch, filters, currentPage, pageSize])


  // Use global products hook with dynamic params
  const { 
    products: allProducts, 
    loading, 
    error,
    total: totalItems,
    createProduct,
    updateProduct,
    deleteProduct
  } = useProducts({ 
    params: apiParams,
    dependencies: [apiParams]
  })

  // Server-side pagination - products already paginated from backend
  const products = allProducts

  // Reset page when filters change (but not when page/pageSize changes)
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, filters])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }
  
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
    try {
      if (formMode === 'create') {
        await createProduct(productData);
      } else {
        await updateProduct(selectedProduct._id, productData);
      }
      setIsFormModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      // Error is already handled by the hook with toast
      console.error('Save product failed:', error);
    }
  };

  const headerCard = (
    <AdminHeader
      title="Product Management"
      description="Manage product inventory and listings"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search products..."
      actionButtons={[
        {
          icon: <Filter className='w-4 h-4' />,
          label: 'Filter',
          onClick: () => setShowFilters((v) => !v)
        },
        {
          icon: <Plus className='w-4 h-4' />,
          label: 'Add',
          onClick: handleAddProduct
        }
      ]}
      filters={
        <ProductFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          categories={categories}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
      }
      showFilters={showFilters}
    />
  )

  const commentsHeader = (
    <AdminHeader
      title="Comments Management"
      description="Moderate and manage customer comments"
      searchQuery={commentsSearchQuery}
      onSearchChange={setCommentsSearchQuery}
      searchPlaceholder="Search comments..."
    />
  )

  const reviewsHeader = (
    <AdminHeader
      title="Reviews Management"
      description="View and manage product reviews"
      searchQuery={reviewsSearchQuery}
      onSearchChange={setReviewsSearchQuery}
      searchPlaceholder="Search reviews..."
    />
  )

  const categoriesHeader = (
    <AdminHeader
      title="Categories Management"
      description="Manage product categories and display order"
      searchQuery={categoriesSearchQuery}
      onSearchChange={setCategoriesSearchQuery}
      searchPlaceholder="Search categories..."
    />
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
            <TabsTrigger 
              value='reviews'
              className='flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 px-4 py-2 rounded-lg transition-all'
            >
              <Star size={16} />
              Reviews
            </TabsTrigger>
            <TabsTrigger 
              value='categories'
              className='flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 px-4 py-2 rounded-lg transition-all'
            >
              <Layers size={16} />
              Categories
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
              
              {/* Pagination */}
              {totalItems > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  pageSizeOptions={[12, 24, 48]}
                />
              )}
            </AdminContent>
          </TabsContent>

          {/* Comments Tab Content */}
          <TabsContent value='comments' className='mt-4'>
            <AdminContent header={commentsHeader}>
              <CommentsManagement externalSearchQuery={commentsSearchQuery} />
            </AdminContent>
          </TabsContent>

          {/* Reviews Tab Content */}
          <TabsContent value='reviews' className='mt-4'>
            <AdminContent header={reviewsHeader}>
              <ReviewsManagement externalSearchQuery={reviewsSearchQuery} />
            </AdminContent>
          </TabsContent>

          {/* Categories Tab Content */}
          <TabsContent value='categories' className='mt-4'>
            <AdminContent header={categoriesHeader}>
              <CategoriesManagement externalSearchQuery={categoriesSearchQuery} />
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
