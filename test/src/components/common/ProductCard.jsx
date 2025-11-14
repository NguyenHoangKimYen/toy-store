import React from 'react';
import { ShoppingCart } from 'lucide-react';
import './ProductCard.css';

/**
 * Reusable Product Card Component
 * @param {Object} product - Product data object
 * @param {string} variant - 'default', 'horizontal', 'compact'
 * @param {Function} onClick - Card click handler (navigates to product detail)
 * @param {Function} onQuickView - Quick view handler
 * @param {Function} onAddToCart - Add to cart handler
 */
const ProductCard = ({ 
  product, 
  variant = 'default',
  onClick,
  onQuickView,
  onAddToCart,
  showBadges = true,
  showCategory = true,
  showQuickView = true,
  className = ''
}) => {
  if (!product) return null;

  const price = product.minPrice || product.price?.$numberDecimal || product.price;
  const originalPrice = product.maxPrice || product.originalPrice?.$numberDecimal || product.originalPrice;
  const imageUrl = product.imageUrls?.[0] || '/placeholder.png';
  const categoryName = product.categoryId?.[0]?.name || product.categoryId?.name || 'Uncategorized';

  const handleCardClick = () => {
    onClick?.(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  // Horizontal variant (for category rows)
  if (variant === 'horizontal') {
    return (
      <div className={`product-card-horizontal ${className}`} onClick={handleCardClick}>
        <div className="product-card-image">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
          />
          {showBadges && product.isNew && (
            <span className="badge badge-new">New</span>
          )}
          {showBadges && product.isFeatured && (
            <span className="badge badge-featured">Featured</span>
          )}
        </div>
        <div className="product-card-content">
          <p className="product-card-name">{product.name}</p>
          {showCategory && (
            <p className="product-card-category">{categoryName}</p>
          )}
          <p className="product-card-price">
            ${price?.toLocaleString()}
          </p>
          {originalPrice && (
            <p className="product-card-original-price">
              ${originalPrice?.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Compact variant (for small grids)
  if (variant === 'compact') {
    return (
      <div className={`product-card-compact ${className}`} onClick={handleCardClick}>
        <div className="product-card-image">
          <img src={imageUrl} alt={product.name} loading="lazy" />
          {showBadges && product.stockQuantity === 0 && (
            <span className="badge badge-out">Out of Stock</span>
          )}
        </div>
        <div className="product-card-content">
          <h4 className="product-card-name">{product.name}</h4>
          <p className="product-card-price">${price?.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  // Default variant (full featured)
  return (
    <div className={`product-card ${className}`} onClick={handleCardClick}>
      <div className="product-image-wrapper">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {showBadges && (
          <>
            {product.isNew && (
              <span className="badge badge-new">New</span>
            )}
            {product.isFeatured && (
              <span className="badge badge-featured">Featured</span>
            )}
            {product.stockQuantity === 0 && (
              <span className="badge badge-out">Out of Stock</span>
            )}
          </>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {showCategory && (
          <p className="product-category">{categoryName}</p>
        )}
        
        <div className="product-footer">
          <div className="product-price">
            <span className="current-price">
              ${price?.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="original-price">
                ${originalPrice?.toLocaleString()}
              </span>
            )}
          </div>
          
          {onAddToCart && (
            <button 
              className="add-to-cart-btn" 
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
      </div>

      {showQuickView && onQuickView && (
        <div className="product-hover-overlay">
          <button 
            className="quick-view-btn"
            onClick={handleQuickView}
          >
            Quick View
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
