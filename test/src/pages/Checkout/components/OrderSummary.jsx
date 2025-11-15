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
        {cartItems.map((item) => (
          <div key={item._id} className="order-item">
            <img
              src={item.product.imageUrls?.[0] || '/placeholder.png'}
              alt={item.product.name}
              className="order-item-image"
            />
            <div className="order-item-details">
              <h3 className="order-item-name">{item.product.name}</h3>
              <p className="order-item-quantity">Qty: {item.quantity}</p>
            </div>
            <div className="order-item-price">
              {formatPrice(item.product.price * item.quantity)}
            </div>
          </div>
        ))}
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
