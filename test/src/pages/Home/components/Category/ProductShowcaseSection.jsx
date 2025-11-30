import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/common';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import './ProductShowcaseSection.css';

const ProductShowcaseSection = ({ 
  title, 
  subtitle, 
  products, 
  viewAllLink,
  loading = false,
  showViewAll = true
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleViewAll = () => {
    navigate(viewAllLink);
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <section className="home-section product-showcase">
      <div className="section-container">
        {/* Header */}
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          {showViewAll && (
            <button onClick={handleViewAll} className="view-all-btn">
              View All
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Products */}
        <div className="products-scroll-wrapper">
          <button 
            className="scroll-btn scroll-btn-left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          <div ref={scrollRef} className="products-scroll">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="skeleton skeleton-card" />
              ))
            ) : (
              products.slice(0, 12).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showBadges={true}
                  showCategory={false}
                  showQuickView={false}
                  onClick={handleProductClick}
                />
              ))
            )}
          </div>

          <button 
            className="scroll-btn scroll-btn-right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcaseSection;
