import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/utils/formatPrice';
import './OrderSummary.css';

const OrderSummary = ({
  cartItems,
  subtotal,
  shipping,
  tax,
  total,
  onSubmit,
  submitting,
}) => {
  return (
    <Card className="order-summary-card">
      <h2 className="order-summary-title">Order Summary</h2>

      {/* Cart Items */}
      <div className="order-items">
        {cartItems.map((item) => {
          // Extract price, handling $numberDecimal format
          let price = 0;
          if (item.variant?.price) {
            price = typeof item.variant.price === 'object' 
              ? parseFloat(item.variant.price.$numberDecimal || item.variant.price) 
              : parseFloat(item.variant.price);
          } else if (item.product?.minPrice) {
            price = typeof item.product.minPrice === 'object'
              ? parseFloat(item.product.minPrice.$numberDecimal || item.product.minPrice)
              : parseFloat(item.product.minPrice);
          } else if (item.product?.price) {
            price = typeof item.product.price === 'object'
              ? parseFloat(item.product.price.$numberDecimal || item.product.price)
              : parseFloat(item.product.price);
          }
          
          const imageUrl = item.variant?.imageUrls?.[0] || item.product?.imageUrls?.[0] || '/placeholder.png';
          const variantInfo = item.variant?.attributes?.map(attr => `${attr.name}: ${attr.value}`).join(', ');
          
          return (
            <div key={item._id} className="order-item">
              <img
                src={imageUrl}
                alt={item.product?.name || 'Product'}
                className="order-item-image"
              />
              <div className="order-item-details">
                <h3 className="order-item-name">{item.product?.name || 'Product'}</h3>
                {variantInfo && <p className="order-item-variant">{variantInfo}</p>}
                <p className="order-item-quantity">Qty: {item.quantity || 0}</p>
              </div>
              <div className="order-item-price">
                {formatPrice(price * (item.quantity || 0))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Breakdown */}
      <div className="order-totals">
        <div className="order-total-row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="order-total-row">
          <span>Shipping</span>
          <span>{formatPrice(shipping)}</span>
        </div>
        <div className="order-total-row">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="order-total-row order-total-final">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        size="lg"
        className="place-order-button"
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? 'Processing...' : 'Place Order'}
      </Button>
    </Card>
  );
};

export default OrderSummary;
