import React from 'react';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

const ProductActions = ({
  inStock,
  quantity,
  stock,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  isFavorite,
  onToggleFavorite,
  onShare,
}) => {
  return (
    <>
      {/* Quantity Selector */}
      {inStock && (
        <div className="quantity-selector">
          <h3 className="quantity-title">Quantity</h3>
          <div className="quantity-controls">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </Button>
            <span className="quantity-value">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= stock}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="product-actions">
        <Button
          size="lg"
          onClick={onAddToCart}
          disabled={!inStock}
          className="add-to-cart-btn flex-1"
        >
          <ShoppingCart size={20} className="mr-2" />
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="default"
          onClick={onBuyNow}
          disabled={!inStock}
          className="buy-now-btn flex-1"
        >
          Buy Now
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="secondary-actions">
        <Button
          variant="outline"
          size="lg"
          onClick={onToggleFavorite}
          className="flex-1"
        >
          <Heart size={20} className={`mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          {isFavorite ? 'Saved' : 'Save'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onShare}
          className="flex-1"
        >
          <Share2 size={20} className="mr-2" />
          Share
        </Button>
      </div>
    </>
  );
};

export default ProductActions;
