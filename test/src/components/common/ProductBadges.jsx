import React from 'react';
import Badge from '@/components/ui/badge';
import './ProductBadges.css';

/**
 * Reusable Product Badges Component
 * Displays product status badges (New, Best Seller, Discount)
 * Note: Featured badge removed - not shown to clients
 * 
 * @param {Object} product - Product object
 * @param {boolean} product.isNew - Show "New" badge
 * @param {boolean} product.isBestSeller - Show "Best Seller" badge
 * @param {number} discount - Discount percentage (0 if no discount)
 * @param {string} className - Additional CSS classes
 */
const ProductBadges = ({ product, discount = 0, className = '' }) => {
  if (!product) return null;

  const hasBadges = product.isNew || product.isBestSeller || discount > 0;
  
  if (!hasBadges) return null;

  return (
    <div className={`product-badges ${className}`}>
      {product.isNew && <Badge variant="default">New</Badge>}
      {product.isBestSeller && <Badge variant="outline">Best Seller</Badge>}
      {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
    </div>
  );
};

export default ProductBadges;
