import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatPrice';
import './CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const product = item.product;
  // Use minPrice as the display price (in real app, would use variant price if available)
  const price = product.minPrice || product.price?.$numberDecimal || product.price || 0;
  const imageUrl = product.imageUrls?.[0] || '/placeholder.png';
  const total = price * item.quantity;

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item._id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    const maxStock = product.stockQuantity || 999;
    if (item.quantity < maxStock) {
      onUpdateQuantity(item._id, item.quantity + 1);
    }
  };

  return (
    <div className="cart-item">
      {/* Product Image */}
      <div className="cart-item-image-wrapper">
        <img
          src={imageUrl}
          alt={product.name}
          className="cart-item-image"
        />
      </div>

      {/* Product Info */}
      <div className="cart-item-info">
        <h3 className="cart-item-name">{product.name}</h3>
        {product.categoryId?.[0]?.name && (
          <p className="cart-item-category">{product.categoryId[0].name}</p>
        )}
        <p className="cart-item-price">{formatPrice(price)}</p>
        
        {/* Stock Status */}
        {product.stockQuantity < 10 && product.stockQuantity > 0 && (
          <span className="cart-item-stock-warning">
            Only {product.stockQuantity} left in stock
          </span>
        )}
        {product.stockQuantity === 0 && (
          <span className="cart-item-out-of-stock">Out of stock</span>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="cart-item-quantity">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={item.quantity <= 1}
          className="quantity-btn"
        >
          <Minus size={16} />
        </Button>
        <span className="quantity-value">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={item.quantity >= (product.stockQuantity || 999)}
          className="quantity-btn"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Total Price */}
      <div className="cart-item-total">
        <span className="total-label">Total:</span>
        <span className="total-price">{formatPrice(total)}</span>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item._id)}
        className="remove-btn"
      >
        <Trash2 size={20} />
      </Button>
    </div>
  );
};

export default CartItem;
