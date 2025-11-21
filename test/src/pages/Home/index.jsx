import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from './components/Hero';
import { NewArrivalsSection, CategorizedProductsSection } from './components/Category';
import { FeaturedBanner } from './components/Banner';
import { useCategorizedProducts, useCategories } from '@/hooks';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { ProductCard } from '@/components/common';
import './components/Category/NewArrivalsSection.css';

const Home = () => {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const [categoryConfig, setCategoryConfig] = useState([]);

  // Build category config once categories are loaded
  useEffect(() => {
    if (categories && categories.length > 0) {
      // Map categories to config format using ObjectId
      const config = categories.slice(0, 4).map(cat => ({
        key: cat.slug, // Use slug as key for React
        categoryId: cat._id, // Use ObjectId for API query
        name: cat.name, // Store name for display
        limit: 12
      }));
      setCategoryConfig(config);
    }
  }, [categories]);

  const { categorizedProducts, loading, error } = useCategorizedProducts({
    featured: { limit: 6 },
    newProducts: { limit: 8 },
    bestSellers: { limit: 8 },
    categories: categoryConfig,
  });

  if (loading || categoriesLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <LoadingSpinner/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-5 text-center">
        <ErrorMessage 
          title="Oops! Something went wrong"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section with Featured Products Carousel */}
      {categorizedProducts.featured && categorizedProducts.featured.length > 0 && (
        <HeroSection featuredProducts={categorizedProducts.featured} />
      )}

      {/* Featured Banner */}
      <FeaturedBanner />

      {/* New Arrivals Section - Above Everything */}
      <NewArrivalsSection newProducts={categorizedProducts.newProducts} />

      {/* Best Sellers Section */}
      {categorizedProducts.bestSellers && categorizedProducts.bestSellers.length > 0 && (
        <section className="px-[5%] py-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 max-w-[1600px] mx-auto pb-6 border-b-2 border-slate-100">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Best Sellers</h2>
              <p className="text-sm text-slate-500">Customer favorites</p>
            </div>
          </div>
          <div className="relative">
            <div className="products-horizontal-scroll">
              {categorizedProducts.bestSellers.slice(0, 12).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  variant="horizontal"
                  showBadges={true}
                  showCategory={false}
                  showQuickView={false}
                  onClick={(product) => navigate(`/products/${product._id}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categorized Products Section */}
      <div className="px-[5%]">
        <CategorizedProductsSection />
      </div>
    </div>
  );
};

export default Home;
