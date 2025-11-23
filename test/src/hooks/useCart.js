import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [loading, setLoading] = useState(false); // Only for initial load or major actions (clear/delete)
  const [error, setError] = useState(null);
  
  // REFS:
  // 1. Keep a ref of cartItems to avoid stale-closure reads in async callbacks
  const cartItemsRef = useRef([]);
  // 2. Track pending updates and timeouts for debouncing
  const updateTimeoutsRef = useRef(new Map());
  // 3. Track request IDs to prevent race conditions (ignore old responses)
  const requestIdRef = useRef(new Map());

  // Sync Ref with State
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts when component unmounts
      updateTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      updateTimeoutsRef.current.clear();
    };
  }, []);

  // Helper: Normalize ID (handle _id vs id)
  const getItemId = (item) => item?.id || item?._id;

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
    if (authLoading) return;

    try {
      setLoading(true);
      setError(null);

      let cartData;
      if (user?._id) {
        cartData = await getCartByUser(user._id);
      } else {
        const sessionId = getSessionId();
        cartData = await getCartBySession(sessionId);
      }

      setCart(cartData);

      const cartId = cartData?.id || cartData?._id;
      if (cartId) {
        const items = await getCartItems(cartId);
        setCartItems(items);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      if (err.response?.status === 404 || err.message?.includes('not found')) {
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

  // Initialize cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Create or get cart
  const ensureCart = useCallback(async () => {
    // Check current state or ref
    if (cart?.id || cart?._id) return cart;

    try {
      const sessionId = user?._id ? undefined : getSessionId();
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
      // NOTE: removed setLoading(true) to avoid full page spinner on "Add to Cart"
      try {
        setError(null);
        const currentCart = await ensureCart();
        const currentCartId = getItemId(currentCart);

        // Check against REF to avoid stale closure issues
        const existingItem = cartItemsRef.current.find((item) => {
          if (variantId) {
            return item.productId === productId && item.variantId === variantId;
          }
          return item.productId === productId && !item.variantId;
        });

        if (existingItem) {
          // Optimistic Update for existing item
          const existingId = getItemId(existingItem);
          const newQuantity = existingItem.quantity + quantity;

          setCartItems((prev) => prev.map((item) => 
            getItemId(item) === existingId ? { ...item, quantity: newQuantity } : item
          ));

          await updateCartItem(existingId, { quantity: newQuantity });
        } else {
          // For new items, we can't fully optimistic update because we need the real ID from DB.
          // However, we can wait for the response without blocking the whole UI global loader.
          const newItem = await createCartItem({
            cartId: currentCartId,
            variantId: variantId || undefined,
            quantity,
          });

          setCartItems((prev) => [...prev, newItem]);
        }
        
        // Update cart totals (Optimistic-ish)
        if (cart) {
          setCart((prev) => ({
            ...prev,
            itemCount: (prev.itemCount || 0) + quantity,
          }));
        }
      } catch (err) {
        console.error('[CART] addItem failed:', err);
        setError(err.message || 'Failed to add item to cart');
        // Revert/Sync on error
        fetchCart();
        throw err;
      }
    },
    [ensureCart, cart, fetchCart] // Removed cartItems from dependency to prevent churn
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId) => {
      // Capture item from Ref to ensure we have data for revert
      const itemToRemove = cartItemsRef.current.find(item => getItemId(item) === itemId);
      
      try {
        setError(null);
        
        // Optimistic update
        setCartItems((prev) => prev.filter((item) => getItemId(item) !== itemId));

        if (cart && itemToRemove) {
          setCart((prev) => ({
            ...prev,
            itemCount: Math.max(0, (prev.itemCount || 0) - (itemToRemove.quantity || 1)),
          }));
        }

        await deleteCartItem(itemId);
      } catch (err) {
        setError(err.message || 'Failed to remove item');
        console.error('Error removing item:', err);
        
        // Revert optimistic update
        if (itemToRemove) {
          setCartItems((prev) => [...prev, itemToRemove]);
          // Revert totals
          if (cart) {
            setCart((prev) => ({
              ...prev,
              itemCount: (prev.itemCount || 0) + (itemToRemove.quantity || 1),
            }));
          }
        }
        throw err;
      }
    },
    [cart] // Removed cartItems dependency
  );

  // Update item quantity with debouncing
  const updateItemQuantity = useCallback(
    async (itemId, quantity) => {
      // 1. Get current item state from Ref (avoid stale closure)
      const oldItem = cartItemsRef.current.find(item => getItemId(item) === itemId);
      setError(null);

      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      // 2. Optimistic update
      const quantityDiff = oldItem ? quantity - oldItem.quantity : 0;
      
      setCartItems((prev) => prev.map((item) => 
        getItemId(item) === itemId ? { ...item, quantity } : item
      ));

      if (cart && oldItem) {
        setCart((prev) => ({
          ...prev,
          itemCount: Math.max(0, (prev.itemCount || 0) + quantityDiff),
        }));
      }

      // 3. Clear existing timeout
      if (updateTimeoutsRef.current.has(itemId)) {
        clearTimeout(updateTimeoutsRef.current.get(itemId));
      }

      // 4. Track Request ID
      const prevReqId = requestIdRef.current.get(itemId) || 0;
      const newReqId = prevReqId + 1;
      requestIdRef.current.set(itemId, newReqId);

      // 5. Debounce API Call
      const timeoutId = setTimeout(async () => {
        try {
          const updatedItem = await updateCartItem(itemId, { quantity });

          // 6. Race Condition Check: Only apply if this is the LATEST request
          if (requestIdRef.current.get(itemId) === newReqId) {
            setCartItems((prev) => prev.map((item) =>
              getItemId(item) === getItemId(updatedItem) ? updatedItem : item
            ));
            
            // Clean up refs
            updateTimeoutsRef.current.delete(itemId);
            requestIdRef.current.delete(itemId);
          }
        } catch (err) {
          // Only revert if this matches the latest request ID
          if (requestIdRef.current.get(itemId) === newReqId) {
            setError(err.message || 'Failed to update quantity');
            console.error('Error updating quantity:', err);
            
            // Revert to old item
            if (oldItem) {
              setCartItems((prev) => prev.map((item) => 
                getItemId(item) === itemId ? oldItem : item
              ));
              
              // Revert totals
              if (cart) {
                const revertDiff = oldItem.quantity - quantity;
                setCart((prev) => ({
                  ...prev,
                  itemCount: Math.max(0, (prev.itemCount || 0) + revertDiff),
                }));
              }
            }
          }
        }
      }, 300); // 300ms debounce

      updateTimeoutsRef.current.set(itemId, timeoutId);
    },
    [cart, removeItem]
  );

  // Clear all items from cart
  const clearAllItems = useCallback(async () => {
    const currentCartId = cart?.id || cart?._id;
    if (!currentCartId) return;

    try {
      setLoading(true); // Keep global loading for destructive full-cart actions
      setError(null);

      await clearCart(currentCartId);
      setCartItems([]);
      // Optionally fetchCart here if you need to sync totals from server
      // await fetchCart(); 
      setCart((prev) => ({ ...prev, itemCount: 0, totalPrice: 0 }));
    } catch (err) {
      setError(err.message || 'Failed to clear cart');
      console.error('Error clearing cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  // Delete entire cart
  const deleteCurrentCart = useCallback(async () => {
    const currentCartId = cart?.id || cart?._id;
    if (!currentCartId) return;

    try {
      setLoading(true);
      setError(null);

      await deleteCart(currentCartId);
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