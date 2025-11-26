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
  bgGradient = 'from-violet-50 via-purple-50 to-indigo-50',
  decorativeGradient1 = 'from-violet-300/20 to-purple-300/20',
  decorativeGradient2 = 'from-indigo-300/20 to-blue-300/20',
  loading = false,
  showViewAll = true
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);

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
      const scrollAmount = 1200;
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
    <section className={`px-4 sm:px-6 md:px-[5%] py-12 sm:py-16 md:py-20 bg-gradient-to-br ${bgGradient} relative overflow-hidden`}>
      {/* Decorative elements */}
      <div className={`absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br ${decorativeGradient1} rounded-full blur-3xl opacity-60`}></div>
      <div className={`absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-tr ${decorativeGradient2} rounded-full blur-3xl opacity-60`}></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10 max-w-[1600px] mx-auto">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-1">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          {showViewAll && (
            <Button
              onClick={handleViewAll}
              variant="outline"
              className="h-11 px-6 font-semibold rounded-lg transition-all whitespace-nowrap hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="relative">
          {showArrows && (
            <ScrollArrows 
              onScrollLeft={() => scroll('left')}
              onScrollRight={() => scroll('right')}
            />
          )}

          <div ref={scrollRef} className="products-horizontal-scroll">
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
    </section>
  );
};

export default ProductShowcaseSection;
