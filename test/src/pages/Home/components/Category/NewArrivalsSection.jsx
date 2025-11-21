import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/common';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';
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
    <section className="new-arrivals-section">
      <div className="new-arrivals-header">
        <div className="header-left">
          <div className="icon-badge">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="new-arrivals-title">
              New Arrivals
              <Badge variant="default" className="ml-2">NEW</Badge>
            </h2>
            <p className="new-arrivals-subtitle text-muted-foreground">Fresh drops you can't miss</p>
          </div>
        </div>
        <Button
          onClick={handleViewAll}
          variant="outline"
          className="view-all-button"
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="products-scroll-container">
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
