import React from 'react';
import { HeroSection } from './Home/components/Hero';
import { CategorySection, ProductCategoriesSection, NewArrivalsSection } from './Home/components/Category';
import { FeaturedBanner } from './Home/components/Banner';
import { useProductsByCategory } from './Home/hooks/useProductsByCategory';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import './Home/Home.css';

const Home = () => {
  const { categorizedProducts, loading, error } = useProductsByCategory();

  if (loading) {
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
      <HeroSection featuredProducts={categorizedProducts.featured} />

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

      {/* Product Categories Section with shadcn */}
      <ProductCategoriesSection categorizedProducts={categorizedProducts} />

      {/* Keychains */}
      {categorizedProducts.keychains.length > 0 && (
        <CategorySection
          title="Móc Khóa"
          subtitle="Stylish keychains for every style"
          products={categorizedProducts.keychains}
          viewAllLink="/products?category=keychains"
        />
      )}

      {/* Plush Toys */}
      {categorizedProducts.plushToys.length > 0 && (
        <CategorySection
          title="Gấu Bông"
          subtitle="Soft and cuddly companions"
          products={categorizedProducts.plushToys}
          viewAllLink="/products?category=plush"
        />
      )}

      {/* Figures */}
      {categorizedProducts.figures.length > 0 && (
        <CategorySection
          title="Figures & Collectibles"
          subtitle="Premium collectible figures"
          products={categorizedProducts.figures}
          viewAllLink="/products?category=figures"
        />
      )}

      {/* Accessories */}
      {categorizedProducts.accessories.length > 0 && (
        <CategorySection
          title="Phụ Kiện"
          subtitle="Complete your collection"
          products={categorizedProducts.accessories}
          viewAllLink="/products?category=accessories"
        />
      )}
    </div>
  );
};

export default Home;
