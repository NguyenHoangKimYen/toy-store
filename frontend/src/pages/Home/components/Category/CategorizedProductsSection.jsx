import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MoreHorizontal } from 'lucide-react';
import { ProductCard, ScrollArrows } from '@/components/common';
import { getCategories } from '@/services/categories.service';
import { getProducts } from '@/services/products.service';
import './CategorizedProductsSection.css';

const CategorizedProductsSection = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Fetch categories and their products efficiently
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Get only 5 categories from backend (optimized query)
        const response = await getCategories({ limit: 5 });
        const limitedCategories = Array.isArray(response)
          ? response
          : (response.categories || response.data || []);

        // 2. Fetch products for each category (limited to 10 per category)
        const categoryProducts = await Promise.all(
          limitedCategories.map(async (cat) => {
            try {
              const products = await getProducts({ 
                categoryId: cat._id, 
                limit: 10,
                status: 'Published'
              });
              const productList = products?.products || products || [];
              return {
                id: cat._id,
                name: cat.name,
                description: cat.description || 'Discover our collection',
                products: Array.isArray(productList) ? productList : [],
                viewAllLink: `/products?category=${cat._id}`,
                bgImageUrl: cat.backgroundImage || '',
              };
            } catch (err) {
              return null;
            }
          })
        );

        setCategoryData(categoryProducts.filter(cat => cat && cat.products.length > 0));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const scroll = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -800 : 800,
      behavior: 'smooth'
    });
  };

  const scrollTabs = (direction) => {
    tabsScrollRef.current?.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <section className="categorized-products-loading">
        <p>Loading categories...</p>
      </section>
    );
  }

  if (categoryData.length === 0) return null;

  const activeCategory = categoryData[activeIndex] || categoryData[0];
  const visibleCategories = categoryData; // Already limited to 3 from backend

  return (
    <div className="categorized-products-showcase">
      {/* Animated Background */}
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

      <div className="categorized-products-overlay" />

      <div className="categorized-products-content">
        {/* Category Tabs */}
        <div className="categorized-products-tabs-wrapper">
          <div className="categorized-products-tabs">
            {visibleCategories.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => setActiveIndex(idx)}
                className={`categorized-products-tab ${idx === activeIndex ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}
            
            {/* "More" button - navigates to products page */}
            <button
              onClick={() => navigate('/products')}
              className="categorized-products-tab categorized-more-btn"
            >
              <MoreHorizontal size={16} />
              More
            </button>
          </div>
        </div>

        {/* Category Header */}
        <div className="categorized-products-header">
          <p className="categorized-products-subtitle">{activeCategory.description}</p>
        </div>

        {/* Products List */}
        <div className="categorized-products-list-wrapper">
          {activeCategory.products.length >= 5 && (
            <ScrollArrows 
              onScrollLeft={() => scroll('left')}
              onScrollRight={() => scroll('right')}
            />
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
                    onClick={() => navigate(`/products/${product._id}`)}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <div className="categorized-products-footer">
          <button
            onClick={() => navigate(activeCategory.viewAllLink)}
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
