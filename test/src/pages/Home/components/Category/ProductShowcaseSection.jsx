import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard, ScrollArrows } from '@/components/common';
import { ArrowRight } from 'lucide-react';
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
  const [showArrows, setShowArrows] = useState(false);
  const isBestSeller = title?.toLowerCase().includes('best');
  const kickerText = isBestSeller ? 'Top picks' : 'Just in';

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        const hasOverflow = scrollRef.current.scrollWidth > scrollRef.current.clientWidth;
        setShowArrows(hasOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    return () => window.removeEventListener('resize', checkOverflow);
  }, [products]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = Math.max(scrollRef.current.clientWidth * 0.8, 420);
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
    <section className="px-3 sm:px-4 md:px-[5%] py-8 sm:py-12 md:py-20 milkybloom-section relative overflow-hidden">
      
      <div className="relative z-10">
        <div className="showcase-shell max-w-[1600px] mx-auto">
          <div className="showcase-headline">
            <div className="head-left">
              <span className="showcase-kicker">{kickerText}</span>
              <div className="head-text">
                <h2 className="showcase-title">{title}</h2>
                <p className="showcase-subtitle">{subtitle}</p>
              </div>
            </div>
            {showViewAll && (
              <Button
                onClick={handleViewAll}
                variant="outline"
                className="viewall-btn"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="relative showcase-rail-wrapper">
            {showArrows && (
              <ScrollArrows 
                onScrollLeft={() => scroll('left')}
                onScrollRight={() => scroll('right')}
              />
            )}

            <div ref={scrollRef} className="products-horizontal-scroll showcase-rail">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-[280px] flex-shrink-0">
                    <div className="animate-pulse bg-gray-200 rounded-lg h-[380px]"></div>
                  </div>
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
            {/* Scroll indicator for mobile */}
            <div className="scroll-indicator"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcaseSection;
