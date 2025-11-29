import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  getCartByUser,
  getCartBySession,
  createCart,
  addItemToCart,
  removeItemFromCart,
  clearCart,
  socketService,
} from "@/services";

/**
 * Custom hook for managing shopping cart functionality
 * Handles cart operations with optimistic updates and error recovery
 */
export function useCart(userId = null) {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemLoading, setItemLoading] = useState({});

  // Refs for tracking state and pending operations
  const cartItemsRef = useRef([]);
  const debouncedUpdateRef = useRef({});
  const pendingQuantityRef = useRef({}); // Track what quantity we're aiming for

  // Session ID for guest carts
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  }, []);

  /**
   * Fetch cart data and extract items
   * @param {boolean} silent - If true, don't show loading state (for background refreshes)
   */
  const fetchCart = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      let cartData = null;

      if (userId) {
        cartData = await getCartByUser(userId);
      } else {
        const sessionId = getSessionId();
        cartData = await getCartBySession(sessionId);
      }

      if (cartData) {
        setCart(cartData);
        // Items are embedded in cart response
        const cartItems = cartData.items || [];
        setItems(cartItems);
        cartItemsRef.current = cartItems;
      } else {
        setCart(null);
        setItems([]);
        cartItemsRef.current = [];
      }
    } catch (err) {
      // 404 means no cart exists yet - that's okay
      if (err.response?.status !== 404) {
        setError(err.message || "Failed to fetch cart");
      }
      setCart(null);
      setItems([]);
      cartItemsRef.current = [];
    } finally {
      setLoading(false);
    }
  }, [userId, getSessionId]);

  /**
   * Ensure a cart exists, creating one if necessary
   */
  const ensureCart = useCallback(async () => {
    if (cart) return cart;

    try {
      const cartData = {
        userId: userId || null,
        sessionId: userId ? null : getSessionId(),
      };
      const newCart = await createCart(cartData);
      setCart(newCart);
      setItems([]);
      cartItemsRef.current = [];
      return newCart;
    } catch (err) {
      setError(err.message || "Failed to create cart");
      throw err;
    }
  }, [cart, userId, getSessionId]);

  /**
   * Sync quantity change to backend (debounced helper)
   */
  const syncQuantityToBackend = useCallback(async (variantId) => {
    const cartId = cart?._id || cart?.id;
    if (!cartId) return;

    // Get the server quantity
    const serverItem = cartItemsRef.current.find((item) => {
      const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
      return itemVariantId === variantId;
    });
    
    if (!serverItem) return;

    // Get the target quantity from ref
    const targetQty = pendingQuantityRef.current[variantId];
    if (targetQty === undefined) return;

    const diff = targetQty - serverItem.quantity;
    if (diff === 0) {
      delete pendingQuantityRef.current[variantId];
      return;
    }

    setItemLoading((prev) => ({ ...prev, [variantId]: true }));

    try {
      if (diff > 0) {
        await addItemToCart({ cartId, variantId, quantity: diff });
      } else {
        await removeItemFromCart(cartId, { variantId, quantity: Math.abs(diff) });
      }
      
      // Update server state ref to match what we just sent
      const updatedItems = cartItemsRef.current.map((item) => {
        const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
        if (itemVariantId === variantId) {
          return { ...item, quantity: targetQty };
        }
        return item;
      });
      cartItemsRef.current = updatedItems;

      // Broadcast to other tabs
      socketService.broadcastCartUpdate({ ...cart, items: updatedItems });

      // Clear the pending quantity
      delete pendingQuantityRef.current[variantId];
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError(err.message || "Failed to update quantity");
      // Rollback on error
      delete pendingQuantityRef.current[variantId];
      await fetchCart(true);
    } finally {
      setItemLoading((prev) => ({ ...prev, [variantId]: false }));
    }
  }, [cart, fetchCart]);

  /**
   * Add item to cart
   * @param {string} variantId - The variant ID to add
   * @param {number} quantity - Quantity to add (default: 1)
   */
  const addItem = useCallback(
    async (variantId, quantity = 1) => {
      if (!variantId) {
        console.error("addItem: variantId is required");
        return;
      }

      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        // Ensure we have a cart
        const currentCart = await ensureCart();
        
        // Get cart ID - handle both _id and id formats
        const cartId = currentCart._id || currentCart.id;
        
        if (!cartId) {
          console.error("addItem: cart ID not found", currentCart);
          throw new Error("Cart ID not found");
        }

        // Call API to add item
        await addItemToCart({
          cartId,
          variantId,
          quantity,
        });

        // Refetch cart to get fully populated items (silent - no loading spinner)
        await fetchCart(true);

        // Broadcast to other tabs
        socketService.broadcastCartUpdate({
          items: cartItemsRef.current,
          totalItems: cartItemsRef.current.reduce((sum, item) => sum + item.quantity, 0),
        });
      } catch (err) {
        console.error("Failed to add item to cart:", err);
        setError(err.message || "Failed to add item to cart");
        // Refresh cart to get accurate state (silent - no loading spinner)
        await fetchCart(true);
      } finally {
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [ensureCart, fetchCart]
  );

  /**
   * Remove item from cart (decreases quantity or removes entirely)
   * @param {string} variantId - The variant ID to remove
   * @param {number} quantity - Quantity to remove (default: 1)
   */
  const removeItem = useCallback(
    async (variantId, quantity = 1) => {
      const cartId = cart?._id || cart?.id;
      if (!cartId || !variantId) {
        console.error("removeItem: cart and variantId are required");
        return;
      }

      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        await removeItemFromCart(cartId, {
          variantId,
          quantity,
        });

        // Refetch cart to get fully populated items (silent - no loading spinner)
        await fetchCart(true);

        // Broadcast to other tabs
        socketService.broadcastCartUpdate({
          items: cartItemsRef.current,
          totalItems: cartItemsRef.current.reduce((sum, item) => sum + item.quantity, 0),
        });
      } catch (err) {
        console.error("Failed to remove item from cart:", err);
        setError(err.message || "Failed to remove item from cart");
        await fetchCart(true);
      } finally {
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [cart, fetchCart]
  );

  /**
   * Update item quantity - instant UI, debounced backend sync
   * @param {string} variantId - The variant ID to update
   * @param {number} newQuantity - New quantity to set
   */
  const updateItemQuantity = useCallback(
    (variantId, newQuantity) => {
      if (!variantId) return;

      // Store the latest target quantity
      pendingQuantityRef.current[variantId] = newQuantity;

      // Instant optimistic UI update
      setItems((prevItems) =>
        prevItems.map((item) => {
          const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
          if (itemVariantId === variantId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );

      // Clear existing timeout for this variant
      if (debouncedUpdateRef.current[variantId]) {
        clearTimeout(debouncedUpdateRef.current[variantId]);
      }

      // Schedule new sync - it will read the latest value from pendingQuantityRef
      debouncedUpdateRef.current[variantId] = setTimeout(() => {
        syncQuantityToBackend(variantId);
        delete debouncedUpdateRef.current[variantId];
      }, 400);
    },
    [syncQuantityToBackend]
  );

  /**
   * Remove item completely from cart (remove all quantity)
   * @param {string} variantId - The variant ID to remove completely
   */
  const removeItemCompletely = useCallback(
    async (variantId) => {
      const cartId = cart?._id || cart?.id;
      if (!cartId || !variantId) {
        console.error("removeItemCompletely: cart and variantId are required");
        return;
      }

      // Find current item to get its quantity - backend transforms variantId → variant
      const currentItem = items.find((item) => {
        const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
        return itemVariantId === variantId;
      });

      if (!currentItem) {
        console.error("removeItemCompletely: item not found");
        return;
      }

      // Remove all of this item's quantity
      await removeItem(variantId, currentItem.quantity);
    },
    [cart, items, removeItem]
  );

  /**
   * Clear all items from cart
   */
  const clearAllItems = useCallback(async () => {
    const cartId = cart?._id || cart?.id;
    if (!cartId) {
      console.error("clearAllItems: no cart exists");
      return;
    }

    setLoading(true);
    try {
      await clearCart(cartId);
      setItems([]);
      cartItemsRef.current = [];
      // Refresh cart to get updated state (silent - no loading spinner)
      await fetchCart(true);

      // Broadcast to other tabs
      socketService.broadcastCartUpdate({
        items: [],
        totalItems: 0,
      });
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setError(err.message || "Failed to clear cart");
      await fetchCart(true);
    } finally {
      setLoading(false);
    }
  }, [cart, fetchCart]);

  /**
   * Computed cart summary
   */
  const cartSummary = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const subtotal = items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return sum + price * quantity;
    }, 0);

    return {
      itemCount,
      subtotal,
      items: items.length,
    };
  }, [items]);

  /**
   * Helper to get variant ID from an item
   * Backend transforms variantId → variant in toJSON
   */
  const getItemVariantId = useCallback((item) => {
    if (!item) return null;
    // After toJSON transform: item.variant is the variant object
    return item.variant?._id || item.variant?.id || item.variantId;
  }, []);

  /**
   * Check if a variant is in cart
   */
  const isInCart = useCallback(
    (variantId) => {
      return items.some((item) => getItemVariantId(item) === variantId);
    },
    [items, getItemVariantId]
  );

  /**
   * Get quantity of a variant in cart
   */
  const getQuantity = useCallback(
    (variantId) => {
      const item = items.find(
        (item) => getItemVariantId(item) === variantId
      );
      return item?.quantity || 0;
    },
    [items, getItemVariantId]
  );

  /**
   * Flush all pending quantity updates immediately
   * Call this before checkout to ensure cart is synced
   */
  const flushPendingUpdates = useCallback(async () => {
    // Cancel all pending timeouts
    Object.keys(debouncedUpdateRef.current).forEach((variantId) => {
      clearTimeout(debouncedUpdateRef.current[variantId]);
      delete debouncedUpdateRef.current[variantId];
    });

    // Sync all pending quantities
    const pendingVariants = Object.keys(pendingQuantityRef.current);
    if (pendingVariants.length === 0) return;

    // Execute all syncs in parallel
    await Promise.all(
      pendingVariants.map((variantId) => syncQuantityToBackend(variantId))
    );
  }, [syncQuantityToBackend]);

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Socket.io - Listen for cart updates from other tabs/devices
  useEffect(() => {
    if (!userId) {
      console.log('⚠️ No userId - skipping socket connection');
      return;
    }

    console.log('🔌 Connecting socket for user:', userId);
    
    // Connect socket
    socketService.connect(userId);

    // Listen for cart updates from socket (backend)
    const handleCartUpdate = (data) => {
      console.log('🔔 Cart updated via socket:', data);
      console.log('Current cart items:', items.length);
      
      // Update cart state from socket data
      if (data.cart) {
        setCart(data.cart);
        const cartItems = data.cart.items || [];
        console.log('📦 New cart items from socket:', cartItems.length);
        setItems(cartItems);
        cartItemsRef.current = cartItems;
      }
    };

    socketService.on('cart_updated', handleCartUpdate);

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting socket listener');
      socketService.off('cart_updated', handleCartUpdate);
    };
  }, [userId, items.length]);

  // BroadcastChannel - Listen for cart updates from other tabs (same browser)
  useEffect(() => {
    const handleBroadcast = (data) => {
      console.log('📢 Cart updated via BroadcastChannel:', data);
      if (data.items) {
        setItems(data.items);
        cartItemsRef.current = data.items;
      }
    };

    // Subscribe to broadcast channel (returns unsubscribe function)
    const unsubscribe = socketService.onCartUpdate(handleBroadcast);

    // Cleanup
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const timeouts = debouncedUpdateRef.current;
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, []);

  return {
    // State
    cart,
    items,
    cartItems: items, // Alias for backward compatibility
    loading,
    error,
    itemLoading,

    // Actions
    addItem,
    removeItem,
    updateItemQuantity,
    removeItemCompletely,
    clearAllItems,
    refetch: fetchCart,
    flushPendingUpdates,

    // Computed
    cartSummary,
    isInCart,
    getQuantity,
    getItemVariantId,
  };
}
