import React from 'react';
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

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    shippingInfo,
    paymentMethod,
    subtotal,
    shipping,
    tax,
    total,
    loading,
    error,
    submitting,
    handleShippingChange,
    handlePaymentMethodChange,
    handleSubmitOrder,
  } = useCheckout();

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

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <p>Add some products to checkout</p>
        <Button onClick={() => navigate(ROUTES.PRODUCTS)}>Browse Products</Button>
      </div>
    );
  }

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
            shippingInfo={shippingInfo}
            onChange={handleShippingChange}
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
            cartItems={cartItems}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
            onSubmit={handleSubmitOrder}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
