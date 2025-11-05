import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
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
          <Card 
            key={product._id} 
            className={`new-arrival-card ${index === 0 ? 'featured-card' : ''}`}
            onClick={() => handleProductClick(product._id)}
          >
            <div className="product-image-wrapper">
              <img
                src={product.imageUrls?.[0] || 'https://via.placeholder.com/400x400/3b82f6/ffffff?text=New'}
                alt={product.name}
                loading="lazy"
              />
              <div className="new-badge">
                <Tag className="w-3 h-3" />
                NEW
              </div>
              {index === 0 && (
                <div className="featured-overlay">
                  <Sparkles className="w-5 h-5" />
                  <span>Featured</span>
                </div>
              )}
            </div>
            <CardContent className="product-card-content">
              <p className="product-name">{product.name}</p>
              <div className="product-footer">
                <p className="product-price">
                  ${(product.price?.$numberDecimal || product.price)?.toLocaleString()}
                </p>
                {product.originalPrice && (
                  <span className="original-price">
                    ${(product.originalPrice?.$numberDecimal || product.originalPrice)?.toLocaleString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default NewArrivalsSection;
