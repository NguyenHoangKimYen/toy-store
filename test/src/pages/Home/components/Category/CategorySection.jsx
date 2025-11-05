import React from 'react';
import { ArrowRight } from 'lucide-react';
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
          <div key={product._id} className="product-card">
            <div className="product-image-wrapper">
              <img
                src={product.imageUrls?.[0] || '/placeholder.png'}
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
              {product.isNew && (
                <span className="badge badge-new">New</span>
              )}
              {product.isFeatured && (
                <span className="badge badge-featured">Featured</span>
              )}
              {product.stockQuantity === 0 && (
                <span className="badge badge-out">Out of Stock</span>
              )}
            </div>

            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-category">
                {product.categoryId?.name || 'Uncategorized'}
              </p>
              
              <div className="product-footer">
                <div className="product-price">
                  <span className="current-price">
                    ${(product.price?.$numberDecimal || product.price)?.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="original-price">
                      ${(product.originalPrice?.$numberDecimal || product.originalPrice)?.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <button className="add-to-cart-btn" aria-label="Add to cart">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="product-hover-overlay">
              <button className="quick-view-btn">Quick View</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
