import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/common';
import './CategorySection.css';

const CategorySection = ({ title, subtitle, products, viewAllLink }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="category-section">
      <div className="category-header">
        <div>
          <h2 className="category-title">{title}</h2>
          {subtitle && <p className="category-subtitle">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <a href={viewAllLink} className="view-all-link">
            View All <ArrowRight className="arrow-icon" />
          </a>
        )}
      </div>

      <div className="products-grid">
        {products.slice(0, 8).map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant="default"
            showBadges={true}
            showCategory={true}
            showQuickView={true}
            onQuickView={(product) => console.log('Quick view:', product)}
            onAddToCart={(product) => console.log('Add to cart:', product)}
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
