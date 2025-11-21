import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/common';
import { Button } from '@/components/ui/button';
import './CategorySection.css';

const CategorySection = ({ title, subtitle, products, viewAllLink }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) return null;

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  return (
    <section className="px-[5%] py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 max-w-[1600px] mx-auto pb-6 border-b-2 border-slate-100">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <a href={viewAllLink}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </div>

      <div className="relative max-w-[1600px] mx-auto">
        <div className="products-horizontal-scroll">
          {products.slice(0, 12).map((product) => (
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

export default CategorySection;
