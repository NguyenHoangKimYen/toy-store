import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { parsePrice } from '@/utils/priceUtils';
import './ProductCard.css';

/**
 * Simplified Product Card Component
 * Style this component where it's used by adding custom CSS classes via the className prop
 * 
 * @param {Object} product - Product data object
 * @param {Function} onClick - Card click handler (navigates to product detail)
 * @param {Function} onQuickView - Quick view button handler
 * @param {Function} onAddToCart - Add to cart button handler
 * @param {boolean} showBadges - Show product badges (New, Featured, etc.)
 * @param {boolean} showCategory - Show category name below product name
 * @param {boolean} showQuickView - Show quick view overlay button on hover
 * @param {boolean} showAddToCart - Show add to cart button
 * @param {string} className - Additional CSS classes for custom styling
 * @param {React.ReactNode} children - Optional additional content (for custom buttons, badges, etc.)
 */
const ProductCard = ({ 
  product, 
  onClick,
  onQuickView,
  onAddToCart,
  showBadges = true,
  showCategory = true,
  showQuickView = true,
  showAddToCart = true,
  className = '',
  children
}) => {
  if (!product) return null;

  // Handle price display - always show min price
  const hasVariants = product.variants && product.variants.length > 0;
  const minPrice = parsePrice(product.minPrice);
  const singlePrice = parsePrice(product.price);
  const priceDisplay = hasVariants && minPrice ? formatPrice(minPrice) : formatPrice(singlePrice);

  const imageUrl = product.imageUrls?.[0] || '/placeholder.png';
  
  // Safely extract category name
  let categoryName = 'Uncategorized';
  if (Array.isArray(product.categoryId)) {
    categoryName = product.categoryId[0]?.name || 'Uncategorized';
  } else if (product.categoryId && typeof product.categoryId === 'object') {
    categoryName = product.categoryId.name || 'Uncategorized';
  } else if (typeof product.categoryId === 'string') {
    categoryName = product.categoryId;
  }
  
  const totalStock = product.totalStock ?? 0;

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

  return (
    <div 
      className={`product-card ${totalStock === 0 ? 'out-of-stock' : ''} ${className}`} 
      onClick={handleCardClick}
    >
      <div className="product-image-wrapper">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {showBadges && product.isNew && (
          <span className="badge badge-new">New</span>
        )}
        {totalStock === 0 && (
          <div className="out-of-stock-overlay">
            <span className="out-of-stock-text">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {showCategory && (
          <p className="product-category">{categoryName}</p>
        )}
        
        <div className="product-footer">
          <div className="product-price">
            <span className="current-price">{priceDisplay}</span>
          </div>
          
          {showAddToCart && onAddToCart ? (
            <button 
              className="add-to-cart-btn" 
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <ShoppingCart size={18} />
            </button>
          ) : (
            <div className="product-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#64748b', marginRight: '8px' }}>
              <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
              <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
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

      {children}
    </div>
  );
};

export default ProductCard;
