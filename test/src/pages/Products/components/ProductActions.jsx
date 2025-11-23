import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

const ProductActions = ({
  inStock,
  quantity,
  stock,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  selectedVariant,
  loading,
}) => {
  return (
    <>
      {/* Quantity Selector */}
      {selectedVariant && inStock && (
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
            <input
              type="number"
              min="1"
              max={stock}
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                if (value >= 1 && value <= stock) {
                  onQuantityChange(value - quantity);
                }
              }}
              onBlur={(e) => {
                const value = parseInt(e.target.value) || 1;
                if (value < 1) onQuantityChange(1 - quantity);
                if (value > stock) onQuantityChange(stock - quantity);
              }}
              className="quantity-input"
            />
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
          disabled={!selectedVariant || !inStock || loading}
          className="add-to-cart-btn flex-1"
        >
          <ShoppingCart size={20} className="mr-2" />
          {!selectedVariant ? 'Select Options' : 'Add to Cart'}
        </Button>
        <Button
          size="lg"
          variant="default"
          onClick={onBuyNow}
          disabled={!selectedVariant || !inStock || loading}
          className="buy-now-btn flex-1"
        >
          Buy Now
        </Button>
      </div>
    </>
  );
};

export default ProductActions;
