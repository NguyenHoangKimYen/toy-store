import React, { useState } from 'react';
import { LoadingSpinner } from '@/components/common';
import { useProductCatalog } from './hooks';
import ProductToolbar from './components/ProductToolbar';
import ProductFilterSidebar from './components/ProductFilterSidebar';
import ProductGrid from './components/ProductGrid';
import './Products.css';

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
          <div className="products-header-content">
            <h1 className="products-title">Our Products</h1>
            <p className="products-subtitle">
              Discover our collection of {totalProducts} amazing products
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <ProductToolbar
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          totalProducts={totalProducts}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortChange={handleSortChange}
          searchQuery={filters.search}
          onSearchChange={(value) => handleFilterChange('search', value)}
        />

        <div className={`products-content ${!showFilters ? 'filters-hidden' : ''}`}>
          {/* Filters Sidebar */}
          <ProductFilterSidebar
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            categories={categories}
            brands={brands}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Products Grid */}
          <main className="products-main">
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
