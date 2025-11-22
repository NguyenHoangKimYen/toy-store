import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/common';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import './NewArrivalsSection.css';

const NewArrivalsSection = ({ newProducts }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleViewAll = () => {
    navigate('/products?filter=new');
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  if (!newProducts || newProducts.length === 0) return null;

  return (
    <section className="px-[5%] py-20 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-300/20 to-blue-300/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 max-w-[1600px] mx-auto">
          <div>
            <h2 className="text-4xl font-bold text-slate-800 mb-1">New Arrivals</h2>
            <p className="text-sm text-slate-500">Fresh drops you can't miss</p>
          </div>
          <Button
            onClick={handleViewAll}
            variant="outline"
            className="h-11 px-6 font-semibold rounded-lg transition-all whitespace-nowrap hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:-translate-y-0.5 w-full sm:w-auto"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="scroll-arrow scroll-arrow-left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="scroll-arrow scroll-arrow-right"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div ref={scrollRef} className="products-horizontal-scroll">
            {newProducts.slice(0, 12).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showBadges={true}
                showCategory={false}
                showQuickView={false}
                onClick={handleProductClick}
              />
            ))}
          </div>
          {/* Scroll indicator for mobile */}
          <div className="scroll-indicator"></div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsSection;
