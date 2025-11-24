import React, { useState, lazy, Suspense } from 'react';
import { useProductCatalog } from './hooks';
import './Products.css';
import catalogBanner from '@/assets/images/catalog_banner.webp';

// Lazy load heavy components
const ProductToolbar = lazy(() => import('./components/ProductToolbar'));
const ProductFilterSidebar = lazy(() => import('./components/ProductFilterSidebar'));
const ProductGrid = lazy(() => import('./components/ProductGrid'));

const Products = () => {
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    products,
    categories,
    brands,
    loading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    filters,
    hasActiveFilters,
    setCurrentPage,
    handleFilterChange,
    handleSortChange,
    clearFilters,
  } = useProductCatalog();

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="products-page">
      <div className="products-container">
        {/* Header */}
        <div className="products-header">
          <div className="products-header-banner">
            <img 
              src={catalogBanner} 
              alt="Product Catalog Banner" 
              className="products-banner-image"
            />
            {filters.search && (
              <p className="products-search-info">
                Showing results for <strong className="text-orange-600">"{filters.search}"</strong>
                {totalProducts > 0 && <span className="ml-2">({totalProducts} {totalProducts === 1 ? 'product' : 'products'})</span>}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <Suspense fallback={<div className="h-[60px] bg-gray-100 animate-pulse rounded" />}>
          <ProductToolbar
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            totalProducts={totalProducts}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={handleSortChange}
          />
        </Suspense>

        <div className={`products-content ${!showFilters ? 'filters-hidden' : ''}`}>
          {/* Filters Sidebar */}
          <Suspense fallback={<div className="w-[280px] h-screen bg-gray-100 animate-pulse" />}>
            <ProductFilterSidebar
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              categories={categories}
              brands={brands}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </Suspense>

          {/* Products Grid */}
          <main className="products-main">
            <Suspense fallback={<div className="h-[600px] bg-gray-50 animate-pulse rounded-lg" />}>
              <ProductGrid
                products={products}
                loading={loading}
                error={error}
                hasActiveFilters={hasActiveFilters}
                clearFilters={clearFilters}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
