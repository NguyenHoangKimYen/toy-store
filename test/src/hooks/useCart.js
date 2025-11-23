import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getCartByUser,
  getCartBySession,
  createCart,
  clearCart,
  deleteCart,
  createCartItem,
  getCartItems,
  updateCartItem,
  deleteCartItem,
} from '../services';
import { useAuth } from './useAuth';

/**
 * Custom hook for cart management
 * Handles both authenticated user carts and guest session carts
 */
export const useCart = () => {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get or create session ID for guest users
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
  }, []);

  // Fetch cart based on user authentication status
  const fetchCart = useCallback(async () => {
    // Wait for auth to finish loading before fetching cart
    if (authLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let cartData;
      if (user?._id) {
        // Authenticated user - fetch by userId
        cartData = await getCartByUser(user._id);
      } else {
        // Guest user - fetch by sessionId
        const sessionId = getSessionId();
        cartData = await getCartBySession(sessionId);
      }

      setCart(cartData);

      // Fetch cart items if cart exists
      if (cartData?.id) {
        const items = await getCartItems(cartData.id);
        setCartItems(items);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      // If cart doesn't exist, that's okay - it will be created when items are added
      if (err.response?.status === 404 || err.message?.includes('Không tìm thấy') || err.message?.includes('not found')) {
        setCart(null);
        setCartItems([]);
      } else {
        setError(err.message || 'Failed to fetch cart');
        console.error('Error fetching cart:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user, getSessionId, authLoading]);

  // Initialize cart on mount and when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Create or get cart
  const ensureCart = useCallback(async () => {
    if (cart?.id) return cart;

    try {
      const sessionId = user?._id ? undefined : getSessionId();
      // Only send userId OR sessionId, never both, never userId: undefined
      const cartData = user?._id 
        ? { userId: user._id } 
        : { sessionId };
      const newCart = await createCart(cartData);
      setCart(newCart);
      return newCart;
    } catch (err) {
      console.error('Error in ensureCart:', err);
      setError(err.message || 'Failed to create cart');
      throw err;
    }
  }, [cart, user, getSessionId]);

  // Add item to cart
  const addItem = useCallback(
    async (productId, quantity = 1, variantId = null) => {
      try {
        setLoading(true);
        setError(null);

        const currentCart = await ensureCart();

        // Check if item already exists with the same variant
        // Important: Match both productId AND variantId for proper variant separation
        const existingItem = cartItems.find((item) => {
          // If variantId is provided, both product and variant must match
          if (variantId) {
            return item.productId === productId && item.variantId === variantId;
          }
          // If no variantId, only match product and ensure no variant exists
          return item.productId === productId && !item.variantId;
        });

        if (existingItem) {
          // Update quantity of existing item
          const updatedItem = await updateCartItem(existingItem.id, {
            quantity: existingItem.quantity + quantity,
          });

          setCartItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
        } else {
          // Add new item with variant
          const newItem = await createCartItem({
            cartId: currentCart.id,
            variantId: variantId || undefined, // Only include if provided
            quantity,
          });

          setCartItems((prev) => [...prev, newItem]);
        }

        // Refresh cart to get updated totals
        await fetchCart();
      } catch (err) {
        setError(err.message || 'Failed to add item to cart');
        console.error('Error adding item to cart:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ensureCart, cartItems, fetchCart]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId) => {
      try {
        setLoading(true);
        setError(null);

        await deleteCartItem(itemId);
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));

        // Refresh cart to get updated totals
        await fetchCart();
      } catch (err) {
        setError(err.message || 'Failed to remove item from cart');
        console.error('Error removing item from cart:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCart]
  );

  // Update item quantity
  const updateItemQuantity = useCallback(
    async (itemId, quantity) => {
      try {
        setLoading(true);
        setError(null);

        if (quantity <= 0) {
          await removeItem(itemId);
          return;
        }

        const updatedItem = await updateCartItem(itemId, { quantity });
        setCartItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));

        // Refresh cart to get updated totals
        await fetchCart();
      } catch (err) {
        setError(err.message || 'Failed to update item quantity');
        console.error('Error updating item quantity:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCart, removeItem]
  );

  // Clear all items from cart
  const clearAllItems = useCallback(async () => {
    if (!cart?.id) return;

    try {
      setLoading(true);
      setError(null);

      await clearCart(cart.id);
      setCartItems([]);
      await fetchCart();
    } catch (err) {
      setError(err.message || 'Failed to clear cart');
      console.error('Error clearing cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart, fetchCart]);

  // Delete entire cart
  const deleteCurrentCart = useCallback(async () => {
    if (!cart?.id) return;

    try {
      setLoading(true);
      setError(null);

      await deleteCart(cart.id);
      setCart(null);
      setCartItems([]);
    } catch (err) {
      setError(err.message || 'Failed to delete cart');
      console.error('Error deleting cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  // Calculate cart summary (memoized)
  const cartSummary = useMemo(() => ({
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cartItems.reduce((sum, item) => sum + item.quantity * (item.price || 0), 0),
    total: cart?.totalPrice || 0,
    discount: cart?.discountAmount || 0,
  }), [cartItems, cart?.totalPrice, cart?.discountAmount]);

  // Clear session ID (called after login)
  const clearGuestSession = useCallback(() => {
    localStorage.removeItem('guestSessionId');
  }, []);

  return {
    cart,
    cartItems,
    loading,
    error,
    cartSummary,
    fetchCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearAllItems,
    deleteCurrentCart,
    getSessionId,
    clearGuestSession,
  };
};
