import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { ROUTES } from '@/config/routes';
import OrderSummary from './components/OrderSummary';
import ShippingForm from './components/ShippingForm';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import { useCheckout } from './hooks/useCheckout';
import './Checkout.css';

/**
 * Transform backend cart item to frontend format
 * Backend CartItem toJSON transforms:
 * - productId → product (but not populated directly)
 * - variantId → variant (with nested productId populated)
 */
const transformCartItem = (item) => {
  const variant = item.variant || null;
  // Product is populated inside variant.productId (nested populate)
  const product = variant?.productId || item.product || null;
  const variantIdStr = variant?._id || variant?.id;

  return {
    _id: variantIdStr,
    variantId: variantIdStr,
    product: product,
    variant: variant,
    quantity: item.quantity,
    price: item.price,
  };
};

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  const {
    cartItems,
    paymentMethod,
    subtotal,
    shipping,
    discount,
    loyaltyPointsDiscount,
    total,
    loading,
    error,
    submitting,
    handlePaymentMethodChange,
    handleSubmitOrder,
    handleDiscountApplied,
    handlePointsApplied,
  } = useCheckout();

  // Transform cart items for display
  const transformedItems = useMemo(() => {
    if (!cartItems) return [];
    return cartItems.map(transformCartItem);
  }, [cartItems]);

  if (loading) {
    return (
      <div className="checkout-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-error">
        <ErrorMessage message={error} />
        <Button onClick={() => navigate(ROUTES.CART)}>Back to Cart</Button>
      </div>
    );
  }

  if (!transformedItems || transformedItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <p>Add some products to checkout</p>
        <Button onClick={() => navigate(ROUTES.PRODUCTS)}>Browse Products</Button>
      </div>
    );
  }

  const handleCheckout = () => {
    handleSubmitOrder(selectedAddressId);
  };

  return (
    <div className="checkout-container">
      {/* Header */}
      <div className="checkout-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.CART)}
          className="back-button"
        >
          <ChevronLeft size={20} />
          Back to Cart
        </Button>
        <h1 className="checkout-title">Checkout</h1>
      </div>

      <div className="checkout-content">
        {/* Left Column - Forms */}
        <div className="checkout-forms">
          {/* Shipping Information */}
          <ShippingForm
            selectedAddressId={selectedAddressId}
            onAddressSelect={setSelectedAddressId}
          />

          {/* Payment Method */}
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onChange={handlePaymentMethodChange}
          />
        </div>

        {/* Right Column - Order Summary */}
        <div className="checkout-summary">
          <OrderSummary
            cartItems={transformedItems}
            subtotal={subtotal}
            shipping={shipping}
            discount={discount}
            loyaltyPointsDiscount={loyaltyPointsDiscount}
            total={total}
            onSubmit={handleCheckout}
            submitting={submitting}
            onDiscountApplied={handleDiscountApplied}
            onPointsApplied={handlePointsApplied}
            disabled={!selectedAddressId}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
