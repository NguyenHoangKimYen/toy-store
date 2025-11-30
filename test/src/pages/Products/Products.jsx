import React, { useState, lazy, Suspense } from 'react';
import { useProductCatalog } from './hooks';
import './Products.css';

const catalogBannerVideo = 'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/banner/THE+MONSTERS+BIG+INTO+ENERGY+Series.mp4';

// Lazy load heavy components
const ProductGrid = lazy(() => import('./components/ProductGrid'));

const Products = () => {
  const [videoError, setVideoError] = useState(false);
  
  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
  } = useProductCatalog();

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showVideo = !!catalogBannerVideo && !videoError;

  return (
    <div className="products-page">
      <div className="products-container">
        {/* Header */}
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
            {/* Search info removed for clean pastel layout */}
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-content no-filters">
          <main className="products-main">
            <Suspense fallback={<div className="h-[600px] bg-gray-50 animate-pulse rounded-lg" />}>
              <ProductGrid
                products={products}
                loading={loading}
                error={error}
                hasActiveFilters={false}
                clearFilters={() => {}}
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
