import React from 'react';
import { Package, Eye, Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { parsePrice, calculateTotalStock } from '@/utils/priceUtils';
import './AdminProductCard.css';

/**
 * Admin-specific Product Card with management features
 */
const AdminProductCard = ({ 
  product, 
  onClick,
  onEdit,
  onDelete,
  showBadges = true,
  showStock = true,
  showRating = true,
  showCategory = true
}) => {
  if (!product) return null;

  const hasVariants = product.variants && product.variants.length > 0;
  const minPrice = parsePrice(product.minPrice);
  const singlePrice = parsePrice(product.price);
  const priceDisplay = hasVariants && minPrice ? formatPrice(minPrice) : formatPrice(singlePrice);

  const imageUrl = product.imageUrls?.[0] || '/placeholder.png';
  const categoryName = product.categoryId?.[0]?.name || product.categoryId?.name || 'Uncategorized';
  const totalStock = product.totalStock ?? calculateTotalStock(product.variants);

  const handleCardClick = () => {
    onClick?.(product);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(product);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(product._id);
  };

  return (
    <div 
      className={`admin-product-card ${totalStock === 0 ? 'out-of-stock' : ''}`}
      onClick={handleCardClick}
    >
      <div className="admin-product-image">
        <img src={imageUrl} alt={product.name} loading="lazy" />
        {showBadges && (
          <>
            {product.isNew && <span className="badge badge-new">New</span>}
            {product.isFeatured && <span className="badge badge-featured">Featured</span>}
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

      <div className="admin-product-content">
        {showCategory && (
          <p className="admin-product-category">{categoryName}</p>
        )}
        
        <h3 className="admin-product-name">{product.name}</h3>

        <div className="admin-product-price-section">
          <p className="admin-product-price">{priceDisplay}</p>
          {product.originalPrice && (
            <p className="admin-product-original-price">
              {formatPrice(product.originalPrice.$numberDecimal || product.originalPrice)}
            </p>
          )}
        </div>

        {(showStock || showRating) && (
          <div className="admin-product-meta">
            {showStock && (
              <div className="admin-product-stock">
                <Package size={16} />
                <span className={totalStock === 0 ? 'out-of-stock' : ''}>
                  Stock: {totalStock}
                </span>
              </div>
            )}
            {showRating && product.averageRating !== undefined && (
              <div className="admin-product-rating">
                <span>⭐</span>
                <span>{product.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}

        <div className="admin-product-actions">
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
};

export default AdminProductCard;
