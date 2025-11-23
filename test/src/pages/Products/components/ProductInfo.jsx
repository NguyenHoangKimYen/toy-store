import React from 'react';
import { Check, Star } from 'lucide-react';
import Badge from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductBadges } from '@/components/common';
import { formatPrice } from '@/utils/formatPrice';

const ProductInfo = ({ product, rating, reviewCount, price, originalPrice, inStock, stock, discount, selectedVariant }) => {
  return (
    <div className="product-info-section">

      {/* Title & Brand */}
      <h1 className="product-title">{product.name}</h1>
      {product.brand && (
        <p className="product-brand">by <span>{product.brand}</span></p>
      )}

      {/* Rating */}
      <div className="product-rating">
        <div className="rating-stars">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={20}
              fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
              stroke={i < Math.floor(rating) ? '#fbbf24' : '#d1d5db'}
            />
          ))}
        </div>
        <span className="rating-text">
          {rating.toFixed(1)} ({reviewCount} reviews)
        </span>
      </div>

      <Separator className="my-4" />

      {/* Price */}
      <div className="product-pricing">
        {selectedVariant ? (
          <>
            <div className="price-main">
              <span className="detail-current-price">{formatPrice(price)}</span>
              {originalPrice && originalPrice > price && (
                <>
                  <span className="detail-original-price">{formatPrice(originalPrice)}</span>
                  {discount > 0 && (
                    <Badge variant="destructive" className="discount-badge">
                      -{discount}%
                    </Badge>
                  )}
                </>
              )}
            </div>
            <div className="stock-info">
              {inStock ? (
                <Badge variant="outline" className="stock-badge in-stock">
                  <Check size={14} className="mr-1" />
                  In Stock ({stock} available)
                </Badge>
              ) : (
                <Badge variant="destructive" className="stock-badge">
                  Out of Stock
                </Badge>
              )}
            </div>
          </>
        ) : (
          <div className="price-main">
            <span className="detail-current-price text-gray-400">Select all options to see price</span>
          </div>
        )}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="product-short-description">{product.shortDescription}</p>
      )}

      <Separator className="my-4" />
    </div>
  );
};

export default ProductInfo;
