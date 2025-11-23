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
        <div className="my-4">
          <h3 className="text-base font-semibold mb-3 text-slate-800">Quantity</h3>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
              className="rounded-none"
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
              className="quantity-input w-16 text-xl font-semibold text-center border border-slate-200 rounded-md px-2 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= stock}
              className="rounded-none"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6 max-md:hidden">
        <Button
          size="lg"
          onClick={onAddToCart}
          disabled={!selectedVariant || !inStock || loading}
          className="flex-1 text-base font-semibold rounded-none"
        >
          <ShoppingCart size={20} className="mr-2" />
          {!selectedVariant ? 'Select Options' : 'Add to Cart'}
        </Button>
        <Button
          size="lg"
          variant="default"
          onClick={onBuyNow}
          disabled={!selectedVariant || !inStock || loading}
          className="flex-1 text-base font-semibold rounded-none"
        >
          Buy Now
        </Button>
      </div>
    </>
  );
};

export default ProductActions;
