import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/common';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';
import { mockProducts } from '../../data/mockProducts';
import './NewArrivalsSection.css';

const NewArrivalsSection = ({ newProducts }) => {
  const navigate = useNavigate();

  // TEMPORARILY: Use mock data
  const displayProducts = newProducts && newProducts.length > 0 
    ? newProducts 
    : mockProducts.newProducts;

  const handleViewAll = () => {
    navigate('/products?filter=new');
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  if (!displayProducts || displayProducts.length === 0) return null;

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
              <span className="badge-new">NEW</span>
            </h2>
            <p className="new-arrivals-subtitle">Fresh drops you can't miss</p>
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

      <div className="new-arrivals-grid">
        {displayProducts.slice(0, 8).map((product, index) => (
          <div 
            key={product._id}
            className={`new-arrival-wrapper ${index === 0 ? 'featured-wrapper' : ''}`}
          >
            <ProductCard
              product={product}
              variant="default"
              showBadges={true}
              showCategory={false}
              showQuickView={false}
              onQuickView={handleProductClick}
              onAddToCart={(product) => console.log('Add to cart:', product)}
              className={index === 0 ? 'featured-card' : ''}
            />
            {index === 0 && (
              <div className="featured-overlay">
                <Sparkles className="w-5 h-5" />
                <span>Featured</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivalsSection;
