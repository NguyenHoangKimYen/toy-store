import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatPrice';
import { parsePrice } from '@/utils/priceUtils';
import './CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const navigate = useNavigate();
  const product = item.product;
  const variant = item.variant;
  
  if (!product) {
    console.error('Cart item missing product data:', item);
    return null;
  }
  
  // Use variant price if available, otherwise use product price
  const price = parsePrice(variant?.price || product.minPrice || product.price || 0);
  const imageUrl = variant?.imageUrls?.[0] || product.imageUrls?.[0] || '/placeholder.png';
  const stock = variant?.stockQuantity || product.stockQuantity || 999;
  const total = price * item.quantity;
  
  // Get variant attributes for display - handle both array and object formats
  let variantAttributes = '';
  if (variant?.attributes) {
    if (Array.isArray(variant.attributes)) {
      // Array format: [{name: "Color", value: "Red"}, {name: "Size", value: "L"}]
      variantAttributes = variant.attributes
        .map(attr => `${attr.name}: ${attr.value}`)
        .join(' • ');
    } else if (typeof variant.attributes === 'object') {
      // Object format: {Color: "Red", Size: "L"}
      variantAttributes = Object.entries(variant.attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' • ');
    }
  }

  // Debug logging
  console.log('Cart item:', { product: product.name, variant, variantAttributes });

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (item.quantity < stock) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  const handleNavigateToProduct = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div className="cart-item">
      {/* Product Image */}
      <div className="cart-item-image-wrapper" onClick={handleNavigateToProduct}>
        <img
          src={imageUrl}
          alt={product.name}
          className="cart-item-image"
        />
      </div>

      {/* Product Info */}
      <div className="cart-item-info">
        <h3 className="cart-item-name" onClick={handleNavigateToProduct}>{product.name}</h3>
        {product.categoryId?.[0]?.name && (
          <p className="cart-item-category">{product.categoryId[0].name}</p>
        )}
        {variantAttributes && (
          <p className="cart-item-variant">
            <span className="variant-label">Variant: </span>
            <span className="variant-value">{variantAttributes}</span>
          </p>
        )}
        {variant?.sku && (
          <p className="cart-item-sku">SKU: {variant.sku}</p>
        )}
        <p className="cart-item-price">{formatPrice(price)}</p>
        
        {/* Stock Status */}
        {stock < 10 && stock > 0 && (
          <span className="cart-item-stock-warning">
            Only {stock} left in stock
          </span>
        )}
        {stock === 0 && (
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
          disabled={item.quantity >= stock}
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
        onClick={() => onRemove(item.id)}
        className="remove-btn"
      >
        <Trash2 size={20} />
      </Button>
    </div>
  );
};

export default CartItem;
