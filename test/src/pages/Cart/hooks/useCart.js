import { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeFromCart, clearCart } from '@/services/cart.service';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    const price = item.product.price?.$numberDecimal || item.product.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // Load cart items
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCart();
      setCartItems(data);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      setError(null);
      
      // Optimistic update
      setCartItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      await updateCartItem(itemId, newQuantity);
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message || 'Failed to update quantity');
      // Revert on error
      loadCart();
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setError(null);

      // Optimistic update
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));

      await removeFromCart(itemId);
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.message || 'Failed to remove item');
      // Revert on error
      loadCart();
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      setError(null);

      // Optimistic update
      setCartItems([]);

      await clearCart();
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message || 'Failed to clear cart');
      // Revert on error
      loadCart();
    }
  };

  return {
    cartItems,
    loading,
    error,
    subtotal,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    refreshCart: loadCart,
  };
};
