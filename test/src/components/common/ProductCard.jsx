import React from 'react';
import { ShoppingCart, Eye, Edit, Trash2, Package } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import './ProductCard.css';

/**
 * Reusable Product Card Component
 * @param {Object} product - Product data object
 * @param {string} variant - 'default', 'horizontal', 'compact', 'admin'
 * @param {Function} onClick - Card click handler (navigates to product detail)
 * @param {Function} onQuickView - Quick view handler
 * @param {Function} onAddToCart - Add to cart handler
 * @param {Function} onEdit - Edit handler (admin variant)
 * @param {Function} onDelete - Delete handler (admin variant)
 * @param {boolean} showBadges - Show product badges
 * @param {boolean} showCategory - Show category name
 * @param {boolean} showQuickView - Show quick view button
 * @param {boolean} showStock - Show stock information (admin variant)
 * @param {boolean} showRating - Show rating (admin variant)
 * @param {string} className - Additional CSS classes
 * @param {string} size - 'small', 'medium', 'large' - controls card dimensions
 */
const ProductCard = ({ 
  product, 
  variant = 'default',
  onClick,
  onQuickView,
  onAddToCart,
  onEdit,
  onDelete,
  showBadges = true,
  showCategory = true,
  showQuickView = true,
  showStock = false,
  showRating = false,
  className = '',
  size = 'medium'
}) => {
  if (!product) return null;

  // Handle price display for variant-based products
  const hasVariants = product.variants && product.variants.length > 0;
  const minPrice = product.minPrice?.$numberDecimal || product.minPrice;
  
  // For products without variants (legacy), use single price
  const singlePrice = product.price?.$numberDecimal || product.price;
  
  // Determine display price - always show min price only
  let priceDisplay;
  if (hasVariants && minPrice) {
    priceDisplay = formatPrice(minPrice);
  } else {
    priceDisplay = formatPrice(singlePrice);
  }

  const imageUrl = product.imageUrls?.[0] || '/placeholder.png';
  const categoryName = product.categoryId?.[0]?.name || product.categoryId?.name || 'Uncategorized';
  
  // Use totalStock from product data (sum of all variant stocks)
  // Backend/API should calculate and include this field
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

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(product);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(product._id);
  };

  // Admin variant (for admin panel)
  if (variant === 'admin') {
    return (
      <div className={`product-card-admin ${size} ${totalStock === 0 ? 'out-of-stock' : ''} ${className}`} onClick={handleCardClick}>
        <div className="product-card-image">
          <img src={imageUrl} alt={product.name} loading="lazy" />
          {showBadges && (
            <>
              {product.isNew && <span className="badge badge-new">New</span>}
              {product.isFeatured && <span className="badge badge-featured">Featured</span>}
              {/* Status badge */}
              {product.status && product.status !== 'Published' && (
                <span className={`badge badge-${product.status.toLowerCase()}`}>
                  {product.status}
                </span>
              )}
            </>
          )}
          {totalStock === 0 && (
            <div className="out-of-stock-overlay">
              <span className="out-of-stock-text">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="product-card-content">
          {showCategory && (
            <p className="product-card-category">{categoryName}</p>
          )}
          
          <h3 className="product-card-name">{product.name}</h3>

          <div className="product-card-price-section">
            <p className="product-card-price">{priceDisplay}</p>
            {product.originalPrice && (
              <p className="product-card-original-price">
                {formatPrice(product.originalPrice.$numberDecimal || product.originalPrice)}
              </p>
            )}
          </div>

          {(showStock || showRating) && (
            <div className="product-card-meta">
              {showStock && (
                <div className="product-stock">
                  <Package size={16} />
                  <span className={totalStock === 0 ? 'out-of-stock' : ''}>
                    Stock: {totalStock}
                  </span>
                </div>
              )}
              {showRating && product.averageRating !== undefined && (
                <div className="product-rating">
                  <span>⭐</span>
                  <span>{product.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          <div className="product-card-actions">
            {onClick && (
              <button className="action-btn action-view" onClick={handleCardClick}>
                <Eye size={16} />
                <span>View</span>
              </button>
            )}
            {onEdit && (
              <button className="action-btn action-edit" onClick={handleEdit}>
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button className="action-btn action-delete" onClick={handleDelete}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal variant (for category rows)
  if (variant === 'horizontal') {
    return (
      <div className={`product-card-horizontal ${totalStock === 0 ? 'out-of-stock' : ''} ${className}`} onClick={handleCardClick}>
        <div className="product-card-image">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
          />
          {showBadges && product.isNew && (
            <span className="badge badge-new">New</span>
          )}
          {/* Out of Stock Overlay */}
          {totalStock === 0 && (
            <div className="out-of-stock-overlay">
              <span className="out-of-stock-text">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="product-card-content">
          <p className="product-card-name">{product.name}</p>
          {showCategory && (
            <p className="product-card-category">{categoryName}</p>
          )}
          <div className="product-card-footer">
            <p className="product-card-price">
              {priceDisplay}
            </p>
            {onAddToCart && (
              <button 
                className="add-to-cart-btn-small" 
                onClick={handleAddToCart}
                aria-label="Add to cart"
              >
                <ShoppingCart size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Compact variant (for small grids)
  if (variant === 'compact') {
    return (
      <div className={`product-card-compact ${totalStock === 0 ? 'out-of-stock' : ''} ${className}`} onClick={handleCardClick}>
        <div className="product-card-image">
          <img src={imageUrl} alt={product.name} loading="lazy" />
          {showBadges && product.isNew && (
            <span className="badge badge-new">New</span>
          )}
          {/* Out of Stock Overlay */}
          {totalStock === 0 && (
            <div className="out-of-stock-overlay">
              <span className="out-of-stock-text">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="product-card-content">
          <h4 className="product-card-name">{product.name}</h4>
          <p className="product-card-price">{priceDisplay}</p>
        </div>
      </div>
    );
  }

  // Default variant (full featured)
  return (
    <div className={`product-card ${totalStock === 0 ? 'out-of-stock' : ''} ${className}`} onClick={handleCardClick}>
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
          </>
        )}
        {/* Out of Stock Overlay */}
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
            <span className="current-price">
              {priceDisplay}
            </span>
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
