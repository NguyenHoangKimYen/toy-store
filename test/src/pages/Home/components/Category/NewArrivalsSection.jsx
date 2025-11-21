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
    <section className="new-arrivals-section">
      <div className="new-arrivals-header">
        <div>
          <h2 className="new-arrivals-title">New Arrivals</h2>
          <p className="new-arrivals-subtitle">Fresh drops you can't miss</p>
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
