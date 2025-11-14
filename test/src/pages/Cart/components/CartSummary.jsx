import React from 'react';
import { ShoppingCart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import './CartSummary.css';

const CartSummary = ({ subtotal, onCheckout, onContinueShopping }) => {
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <Card className="cart-summary-card">
      <h2 className="cart-summary-title">Order Summary</h2>

      {/* Price Breakdown */}
      <div className="summary-details">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
        </div>
        {shipping === 0 && (
          <p className="free-shipping-notice">
            🎉 You got free shipping!
          </p>
        )}
        {shipping > 0 && subtotal < 100 && (
          <p className="free-shipping-notice">
            Add ${(100 - subtotal).toFixed(2)} more for free shipping
          </p>
        )}
        <div className="summary-row">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="summary-row summary-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Promo Code */}
      <div className="promo-code-section">
        <Tag size={18} />
        <input
          type="text"
          placeholder="Enter promo code"
          className="promo-input"
        />
        <Button variant="outline" size="sm">
          Apply
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="summary-actions">
        <Button
          size="lg"
          onClick={onCheckout}
          className="checkout-btn"
        >
          <ShoppingCart size={20} className="mr-2" />
          Proceed to Checkout
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onContinueShopping}
          className="continue-btn"
        >
          Continue Shopping
        </Button>
      </div>
    </Card>
  );
};

export default CartSummary;
