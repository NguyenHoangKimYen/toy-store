import { useState } from 'react';
import { toast } from 'sonner';
import { useCart as useGlobalCart } from '@/hooks';

export const useCart = () => {
  const {
    cartItems,
    loading,
    error,
    cartSummary,
    updateItemQuantity,
    removeItem,
    clearAllItems,
  } = useGlobalCart();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // Calculate subtotal from cart summary
  const subtotal = cartSummary.subtotal;

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateItemQuantity(itemId, newQuantity);
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error('Failed to update quantity', {
        description: err.message || 'Please try again',
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    setItemToRemove(itemId);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    
    try {
      await removeItem(itemToRemove);
      
      toast.success('Item removed from cart');
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error('Remove failed', {
        description: err.message || 'Failed to remove item',
      });
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
      await clearAllItems();
      
      toast.success('Cart cleared');
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error('Clear failed', {
        description: err.message || 'Failed to clear cart',
      });
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
    // Confirmation dialog state
    showClearConfirm,
    setShowClearConfirm,
    showRemoveConfirm,
    setShowRemoveConfirm,
    confirmClearCart,
    confirmRemoveItem,
  };
};
