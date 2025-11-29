import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { ROUTES } from '@/config/routes';
import CartItem from './components/CartItem';
import CartSummary from './components/CartSummary';
import EmptyCart from './components/EmptyCart';
import { useCart } from './hooks/useCart';
import './Cart.css';

/**
 * Transform backend cart item to frontend format
 * Backend sends: { product: {...}, variant: {...}, quantity, price }
 */
const transformCartItem = (item) => {
  const variant = item.variant || null;
  // Product is sent directly as item.product (already populated by backend)
  const product = item.product || null;
  const variantIdStr = variant?._id || variant?.id || item.variantId;

  return {
    id: variantIdStr,
    variantId: variantIdStr,
    product: product,
    variant: variant,
    quantity: item.quantity,
    price: item.price,
  };
};

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    subtotal,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    showClearConfirm,
    setShowClearConfirm,
    showRemoveConfirm,
    setShowRemoveConfirm,
    confirmClearCart,
    confirmRemoveItem,
  } = useCart();

  if (loading) {
    return (
      <div className="cart-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    // Don't show error page for "cart not found" - it's normal
    if (!error.includes('not found') && !error.includes('404')) {
      return (
        <div className="cart-error">
          <ErrorMessage message={error} />
        </div>
      );
    }
    // Treat "not found" as empty cart
  }

  if (!cartItems || cartItems.length === 0) {
    return <EmptyCart />;
  }

  // Transform cart items for the CartItem component
  const transformedItems = cartItems.map(transformCartItem);

  return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header">
        <div className="cart-title-wrapper">
          <ShoppingBag size={32} />
          <h1 className="cart-title">Shopping Cart</h1>
          <span className="cart-count">({transformedItems.length} items)</span>
        </div>
        <Button
          variant="outline"
          onClick={handleClearCart}
          className="clear-cart-btn"
        >
          Clear Cart
        </Button>
      </div>

      <div className="cart-content">
        {/* Cart Items List */}
        <div className="cart-items-section">
          {transformedItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        {/* Cart Summary */}
        <div className="cart-summary-section">
          <CartSummary
            subtotal={subtotal}
            onCheckout={() => navigate(ROUTES.CHECKOUT)}
            onContinueShopping={() => navigate(ROUTES.PRODUCTS)}
          />
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        onConfirm={confirmClearCart}
        title="Clear Cart"
        description="Are you sure you want to clear your cart? This action cannot be undone."
        confirmText="Clear Cart"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmDialog
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        onConfirm={confirmRemoveItem}
        title="Remove Item"
        description="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default Cart;
