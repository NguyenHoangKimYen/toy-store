import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/common';
import { ArrowRight } from 'lucide-react';
import './NewArrivalsSection.css';

const NewArrivalsSection = ({ newProducts }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/products?filter=new');
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  if (!newProducts || newProducts.length === 0) return null;

  return (
    <section className="px-[5%] py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 max-w-[1600px] mx-auto pb-6 border-b-2 border-slate-100">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">New Arrivals</h2>
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
        <div className="products-horizontal-scroll">
          {newProducts.slice(0, 12).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              variant="horizontal"
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
    </section>
  );
};

export default NewArrivalsSection;
