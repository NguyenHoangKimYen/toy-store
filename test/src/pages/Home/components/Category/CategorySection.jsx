import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/common';
import { Button } from '@/components/ui/button';
import './CategorySection.css';

const CategorySection = ({ title, subtitle, products, viewAllLink, showIcon, icon, iconBgColor, iconGradient }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) return null;

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  return (
    <section className="px-[5%] py-4 first:pt-0">
      <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {showIcon && icon && (
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
                <div className={`w-full h-full flex items-center justify-center rounded-lg text-white bg-gradient-to-br ${iconGradient}`}>
                  {icon}
                </div>
              </div>
            )}
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mb-0">{title}</h2>
              {subtitle && <p className="text-sm md:text-base text-slate-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          {viewAllLink && (
            <Button 
              variant="outline" 
              asChild 
              className="h-10 px-5 text-sm md:text-base font-semibold rounded-lg transition-all whitespace-nowrap hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <a href={viewAllLink}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        <div className="relative">
          <div className="products-horizontal-scroll">{products.slice(0, 12).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              variant="horizontal"
              showBadges={!showIcon}
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

export default CategorySection;
