import React, { useState, lazy, Suspense, useMemo, useCallback } from 'react';
import { SlidersHorizontal, X, ArrowUpDown, Grid3X3, LayoutList, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductCatalog } from './hooks';
import ProductFilters from './components/ProductFilters';
import './Products.css';

const catalogBannerVideo = 'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/banner/THE+MONSTERS+BIG+INTO+ENERGY+Series.mp4';

// Lazy load heavy components
const ProductGrid = lazy(() => import('./components/ProductGrid'));

const Products = () => {
  const [videoError, setVideoError] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  
  const {
    products,
    categories,
    loading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    filters,
    hasActiveFilters,
    setCurrentPage,
    handleFilterChange,
    handleMultipleFilters,
    handleSortChange,
    clearFilters,
  } = useProductCatalog();

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCurrentPage]);

  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters(!showMobileFilters);
    if (!showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showMobileFilters]);

  // Sort options
  const sortOptions = [
    { label: 'Newest', sortBy: 'createdAt', sortOrder: 'desc' },
    { label: 'Oldest', sortBy: 'createdAt', sortOrder: 'asc' },
    { label: 'Price: Low to High', sortBy: 'minPrice', sortOrder: 'asc' },
    { label: 'Price: High to Low', sortBy: 'maxPrice', sortOrder: 'desc' },
    { label: 'Best Selling', sortBy: 'totalUnitsSold', sortOrder: 'desc' },
    { label: 'Rating', sortBy: 'averageRating', sortOrder: 'desc' },
    { label: 'Name: A-Z', sortBy: 'name', sortOrder: 'asc' },
    { label: 'Name: Z-A', sortBy: 'name', sortOrder: 'desc' },
  ];

  const currentSort = sortOptions.find(
    opt => opt.sortBy === filters.sortBy && opt.sortOrder === filters.sortOrder
  ) || sortOptions[0];

  const showVideo = !!catalogBannerVideo && !videoError;

  // Memoize priceRange to prevent unnecessary re-renders
  const priceRange = useMemo(() => ({ min: 0, max: 500 }), []);

  return (
    <div className="products-page">
      <div className="products-container">
        {/* Header Banner */}
        <div className="products-header">
          <div className="products-header-banner">
            <div className="products-banner-media">
              {showVideo ? (
                <video
                  className="products-banner-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onError={() => setVideoError(true)}
                >
                  <source src={catalogBannerVideo} type="video/mp4" />
                </video>
              ) : (
                <div className="products-banner-fallback" aria-label="Product Catalog Banner">
                  MilkyBloom Collection
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="products-toolbar">
          <div className="toolbar-left">
            {/* Filter Toggle (Desktop) */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilters}
              className="filter-toggle-btn desktop-only"
            >
              <SlidersHorizontal size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMobileFilters}
              className="filter-toggle-btn mobile-only"
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && <span className="filter-badge">{Object.values(filters).filter(Boolean).length}</span>}
            </Button>

            {/* Product Count */}
            <div className="products-count">
              <span className="count-number">{totalProducts}</span>
              <span className="count-label">products</span>
            </div>
          </div>

          <div className="toolbar-right">
            {/* Sort Dropdown */}
            <div className="sort-dropdown">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                className="sort-trigger"
              >
                <ArrowUpDown size={16} />
                <span className="sort-label">Sort: {currentSort.label}</span>
                <ChevronDown size={14} className={sortMenuOpen ? 'rotate-180' : ''} />
              </Button>
              
              {sortMenuOpen && (
                <>
                  <div className="sort-backdrop" onClick={() => setSortMenuOpen(false)} />
                  <div className="sort-menu">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.sortBy}-${option.sortOrder}`}
                        className={`sort-option ${currentSort.label === option.label ? 'active' : ''}`}
                        onClick={() => {
                          handleSortChange(option.sortBy, option.sortOrder);
                          setSortMenuOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Products Content */}
        <div className={`products-content ${showFilters ? '' : 'filters-hidden'}`}>
          {/* Filters Sidebar (Desktop) */}
          <aside className={`products-filters ${showFilters ? 'show' : ''}`}>
            <ProductFilters
              key="desktop-filters"
              filters={filters}
              categories={categories}
              priceRange={priceRange}
              onFilterChange={handleFilterChange}
              onMultipleFiltersChange={handleMultipleFilters}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              productCount={totalProducts}
            />
          </aside>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <>
              <div className="filters-backdrop" onClick={toggleMobileFilters} />
              <aside className="products-filters mobile-drawer show">
                <ProductFilters
                  key="mobile-filters"
                  filters={filters}
                  categories={categories}
                  priceRange={priceRange}
                  onFilterChange={handleFilterChange}
                  onMultipleFiltersChange={handleMultipleFilters}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                  isMobile={true}
                  onClose={toggleMobileFilters}
                  productCount={totalProducts}
                />
              </aside>
            </>
          )}

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
