import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getCart, updateCartItem, removeFromCart, clearCart } from '@/services/cart.service';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

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
      const errorMessage = err.message || 'Failed to update quantity';
      setError(errorMessage);
      toast.error('Update failed', {
        description: errorMessage,
      });
      // Revert on error
      loadCart();
    }
  };

  const handleRemoveItem = async (itemId) => {
    setItemToRemove(itemId);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    
    try {
      setError(null);

      // Optimistic update
      setCartItems((prev) => prev.filter((item) => item._id !== itemToRemove));

      await removeFromCart(itemToRemove);
      
      toast.success('Item removed from cart');
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error removing item:', err);
      const errorMessage = err.message || 'Failed to remove item';
      setError(errorMessage);
      toast.error('Remove failed', {
        description: errorMessage,
      });
      // Revert on error
      loadCart();
    } finally {
      setShowRemoveConfirm(false);
      setItemToRemove(null);
    }
  };

  const handleClearCart = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = async () => {
    try {
      setError(null);

      // Optimistic update
      setCartItems([]);

      await clearCart();
      
      toast.success('Cart cleared');
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error clearing cart:', err);
      const errorMessage = err.message || 'Failed to clear cart';
      setError(errorMessage);
      toast.error('Clear failed', {
        description: errorMessage,
      });
      // Revert on error
      loadCart();
    } finally {
      setShowClearConfirm(false);
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
    // Confirmation dialog state
    showClearConfirm,
    setShowClearConfirm,
    showRemoveConfirm,
    setShowRemoveConfirm,
    confirmClearCart,
    confirmRemoveItem,
  };
};
