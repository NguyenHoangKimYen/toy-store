import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { ProductCard } from '@/components/common';
import { getProducts } from '@/services';
import './components/Category/NewArrivalsSection.css';

// Lazy load sections below the fold for faster initial render
const HeroSection = lazy(() => import('./components/Hero').then(m => ({ default: m.HeroSection })));
const NewArrivalsSection = lazy(() => import('./components/Category').then(m => ({ default: m.NewArrivalsSection })));
const CategorizedProductsSection = lazy(() => import('./components/Category').then(m => ({ default: m.CategorizedProductsSection })));
const FeaturedBanner = lazy(() => import('./components/Banner').then(m => ({ default: m.FeaturedBanner })));

const Home = () => {
  const navigate = useNavigate();
  const { categorizedProducts: initialData } = useLoaderData();
  const [bestSellers, setBestSellers] = useState([]);
  const [loadingBestSellers, setLoadingBestSellers] = useState(true);

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
    ...initialData,
    bestSellers,
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section with Featured Products Carousel */}
      {categorizedProducts.featured && categorizedProducts.featured.length > 0 && (
        <Suspense fallback={<div className="h-[600px] bg-gradient-to-br from-violet-50 to-purple-50 animate-pulse" />}>
          <HeroSection featuredProducts={categorizedProducts.featured} />
        </Suspense>
      )}

      {/* Featured Banner */}
      <Suspense fallback={<div className="h-[200px] bg-gray-100 animate-pulse" />}>
        <FeaturedBanner />
      </Suspense>

      {/* New Arrivals Section - Above Everything */}
      <Suspense fallback={<div className="h-[500px] bg-white animate-pulse" />}>
        <NewArrivalsSection newProducts={categorizedProducts.newProducts} />
      </Suspense>

      {/* Best Sellers Section */}
      {(loadingBestSellers || (categorizedProducts.bestSellers && categorizedProducts.bestSellers.length > 0)) && (
        <section className="px-[5%] py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-300/20 to-orange-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-rose-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 max-w-[1600px] mx-auto">
              <div>
                <h2 className="text-4xl font-bold text-slate-800 mb-1">Best Sellers</h2>
                <p className="text-sm text-slate-500">Customer favorites</p>
              </div>
            </div>
            <div className="relative">
              <div className="products-horizontal-scroll">
                {loadingBestSellers ? (
                  // Show shimmer skeletons while loading
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-[280px] flex-shrink-0">
                      <div className="animate-pulse bg-gray-200 rounded-lg h-[380px]"></div>
                    </div>
                  ))
                ) : (
                  categorizedProducts.bestSellers.slice(0, 12).map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      showBadges={true}
                      showCategory={false}
                      showQuickView={false}
                      onClick={(product) => navigate(`/products/${product._id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categorized Products Section */}
      <div className="px-[5%]">
        <Suspense fallback={<div className="h-[800px] bg-gray-50 animate-pulse rounded-lg" />}>
          <CategorizedProductsSection />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
