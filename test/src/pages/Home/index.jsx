import React, { lazy, Suspense } from 'react';
import { useHomeData } from './hooks';
import './Home.css';

const HeroSection = lazy(() => import('./components/Hero').then(m => ({ default: m.HeroSection })));
const ProductShowcaseSection = lazy(() => import('./components/Category').then(m => ({ default: m.ProductShowcaseSection })));
const CategorizedProductsSection = lazy(() => import('./components/Category').then(m => ({ default: m.CategorizedProductsSection })));

/* Loading Skeletons */
const SectionSkeleton = () => (
  <div className="py-12 px-4 sm:px-6 lg:px-[5%]">
    <div className="max-w-[1400px] mx-auto">
      <div className="skeleton w-48 h-8 mb-6 rounded" />
      <div className="flex gap-4 sm:gap-5 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton w-[220px] h-[320px] flex-shrink-0 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

const HeroSkeleton = () => (
  <div className="skeleton h-[70vh] min-h-[500px] max-h-[700px]" />
);

const Home = () => {
  const { featuredProducts, newProducts, bestSellers, loading } = useHomeData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200">
      {/* Hero */}
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
      <Suspense fallback={<SectionSkeleton />}>
        <CategorizedProductsSection />
      </Suspense>
    </div>
  );
};

export default Home;
