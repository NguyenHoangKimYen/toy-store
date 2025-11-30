import React, { lazy, Suspense } from 'react';
import { useHomeData } from './hooks';
import './Home.css';

// Lazy load sections for better initial load performance
const HeroSection = lazy(() => import('./components/Hero').then(m => ({ default: m.HeroSection })));
const ProductShowcaseSection = lazy(() => import('./components/Category').then(m => ({ default: m.ProductShowcaseSection })));
const CategorizedProductsSection = lazy(() => import('./components/Category').then(m => ({ default: m.CategorizedProductsSection })));

// Loading skeleton component
const SectionSkeleton = () => (
  <div className="home-section">
    <div className="section-container">
      <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '1.5rem' }} />
      <div style={{ display: 'flex', gap: '1.25rem', overflow: 'hidden' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    </div>
  </div>
);

const HeroSkeleton = () => (
  <div className="skeleton" style={{ height: '70vh', minHeight: '500px', maxHeight: '700px' }} />
);

const Home = () => {
  const { 
    featuredProducts, 
    newProducts, 
    bestSellers, 
    loading,
  } = useHomeData();

  return (
    <div className="home-page">
      {/* Hero Section */}
      {loading.featured ? (
        <HeroSkeleton />
      ) : featuredProducts.length > 0 ? (
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection featuredProducts={featuredProducts} />
        </Suspense>
      ) : null}

      {/* New Arrivals */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProductShowcaseSection
          title="New Arrivals"
          subtitle="Fresh drops you can't miss"
          products={newProducts}
          viewAllLink="/products?sortBy=createdAt&sortOrder=desc"
          loading={loading.new}
        />
      </Suspense>

      {/* Best Sellers */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProductShowcaseSection
          title="Best Sellers"
          subtitle="Customer favorites"
          products={bestSellers}
          viewAllLink="/products?sortBy=totalUnitsSold&sortOrder=desc"
          loading={loading.bestSellers}
        />
      </Suspense>

      {/* Shop by Category */}
      <Suspense fallback={<SectionSkeleton height="500px" />}>
        <CategorizedProductsSection />
      </Suspense>
    </div>
  );
};

export default Home;
