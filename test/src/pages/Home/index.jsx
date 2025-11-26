import React, { useState, useEffect, lazy, Suspense } from 'react';
import { getProducts } from '@/services';

// Lazy load sections below the fold for faster initial render
const HeroSection = lazy(() => import('./components/Hero').then(m => ({ default: m.HeroSection })));
const ProductShowcaseSection = lazy(() => import('./components/Category').then(m => ({ default: m.ProductShowcaseSection })));
const CategorizedProductsSection = lazy(() => import('./components/Category').then(m => ({ default: m.CategorizedProductsSection })));

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingBestSellers, setLoadingBestSellers] = useState(true);

  // Load featured products immediately (critical)
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const response = await getProducts({ isFeatured: true, limit: 6 });
        const products = response.products || response || [];
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setLoadingFeatured(false);
      }
    };
    
    loadFeatured();
  }, []);

  // Load new products (above fold)
  useEffect(() => {
    const loadNew = async () => {
      try {
        const response = await getProducts({ isNew: true, limit: 8 });
        const products = response.products || response || [];
        setNewProducts(products);
      } catch (error) {
        console.error('Error loading new products:', error);
      } finally {
        setLoadingNew(false);
      }
    };
    
    loadNew();
  }, []);

  // Load best sellers after initial render (progressive enhancement)
  useEffect(() => {
    const loadBestSellers = async () => {
      try {
        const response = await getProducts({ isBestSeller: true, limit: 12 });
        const products = response.products || response || [];
        setBestSellers(products);
      } catch (error) {
        console.error('Error loading best sellers:', error);
      } finally {
        setLoadingBestSellers(false);
      }
    };
    
    loadBestSellers();
  }, []);

  const categorizedProducts = {
    featured: featuredProducts,
    newProducts,
    bestSellers,
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section with Featured Products Carousel */}
      {loadingFeatured ? (
        <div className="h-[100vh] min-h-[600px] max-h-[900px] bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 font-medium">Loading featured products...</p>
          </div>
        </div>
      ) : categorizedProducts.featured && categorizedProducts.featured.length > 0 ? (
        <Suspense fallback={
          <div className="h-[100vh] min-h-[600px] max-h-[900px] bg-gradient-to-br from-violet-50 to-purple-50 animate-pulse" />
        }>
          <HeroSection featuredProducts={categorizedProducts.featured} />
        </Suspense>
      ) : null}

      {/* New Arrivals Section - Above Everything */}
      <Suspense fallback={
        <div className="h-[500px] bg-white animate-pulse px-4 sm:px-6 md:px-[5%] py-12 sm:py-16 md:py-20">
          <div className="h-10 w-64 bg-gray-200 rounded mb-8 sm:mb-10"></div>
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[200px] sm:w-[220px] md:w-[280px] h-[340px] sm:h-[360px] md:h-[380px] bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      }>
        <ProductShowcaseSection
          title="New Arrivals"
          subtitle="Fresh drops you can't miss"
          products={categorizedProducts.newProducts}
          viewAllLink="/products?sortBy=createdAt&sortOrder=desc"
          bgGradient="from-violet-50 via-purple-50 to-indigo-50"
          decorativeGradient1="from-violet-300/20 to-purple-300/20"
          decorativeGradient2="from-indigo-300/20 to-blue-300/20"
          loading={loadingNew}
        />
      </Suspense>

      {/* Best Sellers Section */}
      <Suspense fallback={
        <div className="h-[500px] bg-white animate-pulse px-4 sm:px-6 md:px-[5%] py-12 sm:py-16 md:py-20">
          <div className="h-10 w-64 bg-gray-200 rounded mb-8 sm:mb-10"></div>
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[200px] sm:w-[220px] md:w-[280px] h-[340px] sm:h-[360px] md:h-[380px] bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      }>
        <ProductShowcaseSection
          title="Best Sellers"
          subtitle="Customer favorites"
          products={categorizedProducts.bestSellers}
          viewAllLink="/products?sortBy=totalUnitsSold&sortOrder=desc"
          bgGradient="from-amber-50 via-orange-50 to-rose-50"
          decorativeGradient1="from-amber-300/20 to-orange-300/20"
          decorativeGradient2="from-rose-300/20 to-pink-300/20"
          loading={loadingBestSellers}
        />
      </Suspense>

      {/* Categorized Products Section */}
      <div className="px-4 sm:px-6 md:px-[5%]">
        <Suspense fallback={
          <div className="h-[600px] sm:h-[700px] md:h-[800px] bg-gray-50 animate-pulse rounded-lg" />
        }>
          <CategorizedProductsSection />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
