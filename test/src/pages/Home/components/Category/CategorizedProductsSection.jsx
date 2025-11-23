import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/common';
import { useProducts } from '@/hooks';
import { getCategories } from '@/services/categories.service';
import './CategorizedProductsSection.css';

const CategorizedProductsSection = () => {
  const [categories, setCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  
  const { products: allProducts, loading: productsLoading } = useProducts();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(productsLoading);
        
        const categoriesResponse = await getCategories();
        const allCategories = Array.isArray(categoriesResponse)
          ? categoriesResponse
          : (categoriesResponse.categories || categoriesResponse.data || []);
        
        // Create category data with products
        const categoryData = allCategories.slice(0, 4).map((category) => {
          const categoryProducts = allProducts.filter(p => 
            Array.isArray(p.categoryId) 
              ? p.categoryId.some(catId => catId === category._id || catId._id === category._id)
              : p.categoryId === category._id || p.categoryId?._id === category._id
          ).slice(0, 10);
          
          return {
            id: category._id,
            name: category.name,
            description: category.description || 'Discover our collection',
            products: categoryProducts,
            viewAllLink: `/products?category=${category._id}`,
            bgImageUrl: category.backgroundImage || '', // Add background images later
          };
        }).filter(cat => cat.products.length > 0);
        
        setCategories(categoryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [allProducts, productsLoading]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  const handleViewAll = () => {
    if (activeCategory?.viewAllLink) {
      navigate(activeCategory.viewAllLink);
    }
  };

  if (loading) {
    return (
      <section className="categorized-products-loading">
        <p>Loading categories...</p>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const activeCategory = categories[activeIndex];

  return (
    <div className="categorized-products-showcase">
      {/* Background Layer (Animated) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="categorized-products-bg"
          style={{
            backgroundImage: activeCategory.bgImageUrl 
              ? `url(${activeCategory.bgImageUrl})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className="categorized-products-overlay" />

      {/* Content Layer */}
      <div className="categorized-products-content">
        {/* Tabs */}
        <div className="categorized-products-tabs">
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setActiveIndex(idx)}
              className={`categorized-products-tab ${idx === activeIndex ? 'active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Title & Description */}
        <div className="categorized-products-header">
          <h2 className="categorized-products-title">{activeCategory.name}</h2>
          <p className="categorized-products-subtitle">{activeCategory.description}</p>
        </div>

        {/* Animated Product List */}
        <div className="categorized-products-list-wrapper">
          {/* Left Arrow */}
          {activeCategory.products.length >= 5 && (
            <button
              onClick={() => scroll('left')}
              className="categorized-scroll-arrow categorized-scroll-arrow-left"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow */}
          {activeCategory.products.length >= 5 && (
            <button
              onClick={() => scroll('right')}
              className="categorized-scroll-arrow categorized-scroll-arrow-right"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory.id + '-products'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              ref={scrollRef}
              className="categorized-products-list"
            >
              {activeCategory.products.map((product) => (
                <div key={product._id} className="categorized-product-card">
                  <ProductCard
                    product={product}
                    showBadges={false}
                    showCategory={false}
                    showQuickView={false}
                    showAddToCart={false}
                    onClick={() => handleProductClick(product)}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* View More Button */}
        <div className="categorized-products-footer">
          <button
            onClick={handleViewAll}
            className="categorized-view-more-btn"
          >
            View All <ArrowRight className="ml-2 h-4 w-4 inline" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorizedProductsSection;
