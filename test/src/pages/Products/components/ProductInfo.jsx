import React from 'react';
import { Check, Star } from 'lucide-react';
import Badge from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductBadges } from '@/components/common';
import { formatPrice } from '@/utils/formatPrice';

const ProductInfo = ({ product, rating, reviewCount, price, originalPrice, inStock, stock, discount, selectedVariant }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Title & Brand */}
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight m-0">{product.name}</h1>
      {product.brand && (
        <p className="text-sm md:text-base text-slate-500">
          by <span className="font-semibold text-blue-500">{product.brand}</span>
        </p>
      )}

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className="md:w-5 md:h-5"
              fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
              stroke={i < Math.floor(rating) ? '#fbbf24' : '#d1d5db'}
            />
          ))}
        </div>
        <span className="text-xs md:text-sm text-slate-500">
          {rating.toFixed(1)} ({reviewCount} reviews)
        </span>
      </div>

      <Separator className="my-2 md:my-4" />

      {/* Price */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 md:gap-4">
        {selectedVariant ? (
          <>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <span className="text-2xl md:text-2xl font-medium text-red-500">{formatPrice(price)}</span>
              {originalPrice && originalPrice > price && (
                <>
                  <span className="text-base md:text-lg text-slate-400 line-through">{formatPrice(originalPrice)}</span>
                  {discount > 0 && (
                    <Badge variant="destructive" className="text-xs md:text-sm py-0.5 px-1.5 md:py-1 md:px-2">
                      -{discount}%
                    </Badge>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              {inStock ? (
                <Badge variant="outline" className="flex items-center text-xs md:text-sm text-green-600 border-green-600">
                  <Check size={12} className="mr-1 md:w-3.5 md:h-3.5" />
                  In Stock ({stock})
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs md:text-sm">
                  Out of Stock
                </Badge>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-lg md:text-2xl font-semibold text-gray-400">Select all options to see price</span>
          </div>
        )}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-sm md:text-base text-slate-600 leading-relaxed">{product.shortDescription}</p>
      )}

      <Separator className="my-2 md:my-4" />
    </div>
  );
};

export default ProductInfo;
