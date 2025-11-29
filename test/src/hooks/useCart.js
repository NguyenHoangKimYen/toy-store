import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getCartByUser,
  getCartBySession,
  createCart,
  clearCart,
  deleteCart,
  addItemToCart,
  removeItemFromCart,
} from '../services';
import { useAuth } from './useAuth';

/**
 * Custom hook for cart management
 * Handles both authenticated user carts and guest session carts
 * 
 * Backend API:
 * - GET /carts/user/:userId - Get cart with populated items
 * - GET /carts/session/:sessionId - Get cart with populated items
 * - POST /carts - Create new cart
 * - POST /carts/:cartId/items - Add item { variantId, quantity }
 * - POST /carts/:cartId/remove-item - Remove/decrease item { variantId, quantity }
 * - DELETE /carts/:cartId/clear - Clear all items
 * 
 * Backend returns cart.items already populated with variant and product info
 */
export const useCart = () => {
  const { user, loading: authLoading } = useAuth();
  
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
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
    const timeouts = updateTimeoutsRef.current;
    return () => {
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      timeouts.clear();
    };
  }, []);

  // Helper: Normalize ID (handle _id vs id)
  const getItemId = (item) => item?.id || item?._id;
  
  // Helper: Get variant ID from item (handles populated vs unpopulated)
  const getVariantId = (item) => {
    if (!item) return null;
    // If variantId is populated object
    if (item.variantId && typeof item.variantId === 'object') {
      return item.variantId._id || item.variantId.id;
    }
    // If variantId is string ID
    return item.variantId;
  };

  // Get or create session ID for guest users
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
  }, []);

  /**
   * Extract and normalize cart items from cart response
   * Backend structure: item.variant (populated), item.variant.product (nested)
   * Frontend expects: item.product and item.variant at same level
   */
  const extractCartItems = useCallback((cartData) => {
    if (!cartData) return [];
    const items = cartData.items || [];
    
    // Normalize items to match what CartItem component expects
    return items.map(item => {
      // Handle both raw and toJSON transformed data
      const variant = item.variant || item.variantId;
      // Product can be nested in variant (from populate) or at root level
      const product = item.product || item.productId || variant?.product || variant?.productId;
      
      return {
        ...item,
        id: item.id || item._id,
        product: product,
        variant: variant ? { ...variant, product: undefined, productId: undefined } : null,
        // Ensure price is a number
        price: typeof item.price === 'object' && item.price?.$numberDecimal
          ? parseFloat(item.price.$numberDecimal)
          : item.price,
      };
    });
  }, []);

  // Fetch cart based on user authentication status
  const fetchCart = useCallback(async () => {
    if (authLoading) return;

    try {
      setLoading(true);
      setError(null);

      let cartData = null;
      
      if (user?._id) {
        try {
          cartData = await getCartByUser(user._id);
        } catch (userErr) {
          // If user cart not found, try guest session as fallback
          if (userErr.response?.status === 404 || userErr.message?.includes('not found') || userErr.message?.includes('404')) {
            console.warn('User cart not found, trying guest session');
            const sessionId = getSessionId();
            try {
              cartData = await getCartBySession(sessionId);
            } catch (sessionErr) {
              if (sessionErr.response?.status === 404 || sessionErr.message?.includes('not found') || sessionErr.message?.includes('404')) {
                cartData = null;
              } else {
                throw sessionErr;
              }
            }
          } else {
            throw userErr;
          }
        }
      } else {
        const sessionId = getSessionId();
        try {
          cartData = await getCartBySession(sessionId);
        } catch (err) {
          if (err.response?.status === 404 || err.message?.includes('not found') || err.message?.includes('404')) {
            cartData = null;
          } else {
            throw err;
          }
        }
      }

      setCart(cartData);
      setCartItems(extractCartItems(cartData));
    } catch (err) {
      if (err.response?.status === 404 || err.message?.includes('not found') || err.message?.includes('404')) {
        setCart(null);
        setCartItems([]);
        setError(null);
      } else {
        setError(err.message || 'Failed to fetch cart');
        console.error('Error fetching cart:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user, getSessionId, authLoading, extractCartItems]);

  // Initialize cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Create or get cart
  const ensureCart = useCallback(async () => {
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

  /**
   * Add item to cart
   * Uses backend POST /carts/:cartId/items
   * @param {string} productId - Product ID (for reference, backend uses variantId)
   * @param {number} quantity - Quantity to add
   * @param {string} variantId - Variant ID (required by backend)
   */
  const addItem = useCallback(
    async (productId, quantity = 1, variantId = null) => {
      if (!variantId) {
        console.error('variantId is required for addItem');
        throw new Error('Variant ID is required');
      }

      try {
        setError(null);
        const currentCart = await ensureCart();
        const currentCartId = getItemId(currentCart);

        // Optimistic update - find existing item by variantId
        const existingItem = cartItemsRef.current.find((item) => {
          const itemVariantId = getVariantId(item);
          return itemVariantId === variantId;
        });

        if (existingItem) {
          const existingId = getItemId(existingItem);
          const newQuantity = existingItem.quantity + quantity;

          setCartItems((prev) => prev.map((item) => 
            getItemId(item) === existingId ? { ...item, quantity: newQuantity } : item
          ));
        }

        // Call backend - it handles both add and increment
        const updatedCart = await addItemToCart({
          cartId: currentCartId,
          variantId,
          quantity,
          userId: user?._id, // For socket notification
        });

        // Sync with backend response
        if (updatedCart) {
          setCart(updatedCart);
          setCartItems(extractCartItems(updatedCart));
        }
      } catch (err) {
        console.error('[CART] addItem failed:', err);
        setError(err.message || 'Failed to add item to cart');
        // Revert by re-fetching
        fetchCart();
        throw err;
      }
    },
    [ensureCart, user, fetchCart, extractCartItems]
  );

  /**
   * Remove item completely from cart
   * @param {string} itemId - Cart item ID
   */
  const removeItem = useCallback(
    async (itemId) => {
      const itemToRemove = cartItemsRef.current.find(item => getItemId(item) === itemId);
      if (!itemToRemove) return;

      const variantId = getVariantId(itemToRemove);
      const currentCartId = getItemId(cart);

      if (!currentCartId || !variantId) {
        console.error('Missing cartId or variantId for removeItem');
        return;
      }

      try {
        setError(null);
        
        // Optimistic update
        setCartItems((prev) => prev.filter((item) => getItemId(item) !== itemId));

        // Call backend with quantity equal to item quantity to remove completely
        const updatedCart = await removeItemFromCart(currentCartId, {
          variantId,
          quantity: itemToRemove.quantity, // Remove all
          userId: user?._id,
        });

        // Sync with backend
        if (updatedCart) {
          setCart(updatedCart);
          setCartItems(extractCartItems(updatedCart));
        }
      } catch (err) {
        setError(err.message || 'Failed to remove item');
        console.error('Error removing item:', err);
        // Revert
        fetchCart();
        throw err;
      }
    },
    [cart, user, fetchCart, extractCartItems]
  );

  /**
   * Update item quantity with debouncing
   * Uses add-item for increases, remove-item for decreases
   */
  const updateItemQuantity = useCallback(
    async (itemId, newQuantity) => {
      const oldItem = cartItemsRef.current.find(item => getItemId(item) === itemId);
      if (!oldItem) return;

      setError(null);

      if (newQuantity <= 0) {
        await removeItem(itemId);
        return;
      }

      const variantId = getVariantId(oldItem);
      const currentCartId = getItemId(cart);
      const quantityDiff = newQuantity - oldItem.quantity;

      if (quantityDiff === 0) return;

      // Optimistic update
      setCartItems((prev) => prev.map((item) => 
        getItemId(item) === itemId ? { ...item, quantity: newQuantity } : item
      ));

      // Clear existing timeout for this item
      if (updateTimeoutsRef.current.has(itemId)) {
        clearTimeout(updateTimeoutsRef.current.get(itemId));
      }

      // Track request ID for race condition handling
      const prevReqId = requestIdRef.current.get(itemId) || 0;
      const newReqId = prevReqId + 1;
      requestIdRef.current.set(itemId, newReqId);

      // Debounce API call
      const timeoutId = setTimeout(async () => {
        try {
          let updatedCart;
          
          if (quantityDiff > 0) {
            // Increase quantity - use add-item
            updatedCart = await addItemToCart({
              cartId: currentCartId,
              variantId,
              quantity: quantityDiff,
              userId: user?._id,
            });
          } else {
            // Decrease quantity - use remove-item
            updatedCart = await removeItemFromCart(currentCartId, {
              variantId,
              quantity: Math.abs(quantityDiff),
              userId: user?._id,
            });
          }

          // Only apply if this is the latest request
          if (requestIdRef.current.get(itemId) === newReqId) {
            if (updatedCart) {
              setCart(updatedCart);
              setCartItems(extractCartItems(updatedCart));
            }
            updateTimeoutsRef.current.delete(itemId);
            requestIdRef.current.delete(itemId);
          }
        } catch (err) {
          if (requestIdRef.current.get(itemId) === newReqId) {
            setError(err.message || 'Failed to update quantity');
            console.error('Error updating quantity:', err);
            // Revert
            fetchCart();
          }
        }
      }, 300);

      updateTimeoutsRef.current.set(itemId, timeoutId);
    },
    [cart, user, removeItem, fetchCart, extractCartItems]
  );

  // Clear all items from cart
  const clearAllItems = useCallback(async () => {
    const currentCartId = cart?.id || cart?._id;
    if (!currentCartId) return;

    try {
      setLoading(true);
      setError(null);

      await clearCart(currentCartId);
      setCartItems([]);
      setCart((prev) => prev ? { ...prev, items: [], totalItems: 0, totalPrice: 0 } : null);
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
  const cartSummary = useMemo(() => {
    const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const subtotal = cartItems.reduce((sum, item) => {
      const price = typeof item.price === 'object' && item.price?.$numberDecimal 
        ? parseFloat(item.price.$numberDecimal)
        : (item.price || 0);
      return sum + (item.quantity || 0) * price;
    }, 0);
    
    return {
      itemCount,
      subtotal,
      total: cart?.totalPrice || subtotal,
      discount: cart?.discountAmount || 0,
    };
  }, [cartItems, cart?.totalPrice, cart?.discountAmount]);

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
