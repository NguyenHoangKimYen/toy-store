import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import './CategorySection.css';

const CategorySection = ({ title, subtitle, products, viewAllLink }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="category-section">
      <div className="category-header">
        <div>
          <h2 className="category-title">{title}</h2>
          {subtitle && <p className="category-subtitle text-muted-foreground">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Button variant="outline" asChild>
            <a href={viewAllLink}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
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
