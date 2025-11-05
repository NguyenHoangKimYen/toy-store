import React from 'react';
import HeroSection from './Home/components/HeroSection';
import CategorySection from './Home/components/CategorySection';
import FeaturedBanner from './Home/components/FeaturedBanner';
import { useProductsByCategory } from './Home/hooks/useProductsByCategory';
import './Home/Home.css';

const Home = () => {
  const { categorizedProducts, loading, error } = useProductsByCategory();

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>Loading amazing products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section with Featured Products Carousel */}
      <HeroSection featuredProducts={categorizedProducts.featured} />

      {/* Featured Banner */}
      <FeaturedBanner />

      {/* New Products */}
      <CategorySection
        title="New Arrivals"
        subtitle="Fresh drops you'll love"
        products={categorizedProducts.newProducts}
        viewAllLink="/products?filter=new"
      />

      {/* Best Sellers */}
      <CategorySection
        title="Best Sellers"
        subtitle="Customer favorites"
        products={categorizedProducts.bestSellers}
        viewAllLink="/products?filter=bestsellers"
      />

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
