import React, { useState, useEffect } from 'react';
import { HeroSection } from './components/Hero';
import { CategorySection, ProductCategoriesSection, NewArrivalsSection } from './components/Category';
import { FeaturedBanner } from './components/Banner';
import { useCategorizedProducts, useCategories } from '@/hooks';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import './Home.css';

const Home = () => {
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
      <div className="home-loading">
        <LoadingSpinner/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <ErrorMessage 
          title="Oops! Something went wrong"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section with Featured Products Carousel */}
      {categorizedProducts.featured && categorizedProducts.featured.length > 0 && (
        <HeroSection featuredProducts={categorizedProducts.featured} />
      )}

      {/* Featured Banner */}
      <FeaturedBanner />

      {/* New Arrivals Section - Above Everything */}
      <NewArrivalsSection newProducts={categorizedProducts.newProducts} />

      {/* Best Sellers */}
      <CategorySection
        title="Best Sellers"
        subtitle="Customer favorites"
        products={categorizedProducts.bestSellers}
        viewAllLink="/products?filter=bestsellers"
      />

      {/* Product Categories Section - Shows all categories with products in grid layout */}
      <ProductCategoriesSection categorizedProducts={categorizedProducts} />
    </div>
  );
};

export default Home;
