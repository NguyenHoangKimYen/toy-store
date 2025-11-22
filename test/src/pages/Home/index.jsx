import React from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { HeroSection } from './components/Hero';
import { NewArrivalsSection, CategorizedProductsSection } from './components/Category';
import { FeaturedBanner } from './components/Banner';
import { ProductCard } from '@/components/common';
import './components/Category/NewArrivalsSection.css';

const Home = () => {
  const navigate = useNavigate();
  const { categorizedProducts } = useLoaderData();

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
                {categorizedProducts.bestSellers.slice(0, 12).map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    showBadges={true}
                    showCategory={false}
                    showQuickView={false}
                    onClick={(product) => navigate(`/products/${product._id}`)}
                  />
                ))}
              </div>
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
