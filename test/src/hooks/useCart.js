import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCartByUser,
  getCartBySession,
  createCart,
  addItemToCart,
  removeItemFromCart,
  clearCart,
  socketService, // Keep for BroadcastChannel only
} from "@/services";

/**
 * SIMPLIFIED Cart Hook - No optimistic updates, just trust the server
 */
export function useCart(userId = null) {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemLoading, setItemLoading] = useState({});

  // Debounce timers for quantity updates
  const updateTimersRef = useRef({});
  const pendingQuantitiesRef = useRef({}); // variantId -> target quantity
  const serverQuantitiesRef = useRef({}); // variantId -> last confirmed server quantity

  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  }, []);

  const fetchCart = useCallback(async (silent = false, broadcast = false) => {
    if (!silent) setLoading(true);
    setError(null);
    
    try {
      let cartData = null;
      if (userId) {
        cartData = await getCartByUser(userId);
      } else {
        cartData = await getCartBySession(getSessionId());
      }

      if (cartData) {
        setCart(cartData);
        const cartItems = cartData.items || [];
        setItems(cartItems);
        
        // Update server quantities ref
        const serverQtys = {};
        cartItems.forEach((item) => {
          const variantId = item.variant?._id || item.variant?.id || item.variantId;
          if (variantId) {
            serverQtys[variantId] = item.quantity;
          }
        });
        serverQuantitiesRef.current = serverQtys;
        
        // Broadcast to other tabs if requested
        if (broadcast) {
          socketService.broadcastCartUpdate({ cart: cartData });
        }
      } else {
        setCart(null);
        setItems([]);
        serverQuantitiesRef.current = {};
        
        // Broadcast empty cart to other tabs if requested
        if (broadcast) {
          socketService.broadcastCartUpdate({ cart: null });
        }
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.message || "Failed to fetch cart");
      }
      setCart(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId, getSessionId]);

  const ensureCart = useCallback(async () => {
    if (cart) return cart;

    const cartData = {
      userId: userId || null,
      sessionId: userId ? null : getSessionId(),
    };
    const newCart = await createCart(cartData);
    setCart(newCart);
    setItems([]);
    return newCart;
  }, [cart, userId, getSessionId]);

  // Helper to update local state from API response and broadcast instantly
  const updateCartState = useCallback((cartData, shouldBroadcast = true) => {
    if (cartData) {
      setCart(cartData);
      const cartItems = cartData.items || [];
      setItems(cartItems);
      
      // Update server quantities ref
      const serverQtys = {};
      cartItems.forEach((item) => {
        const variantId = item.variant?._id || item.variant?.id || item.variantId;
        if (variantId) {
          serverQtys[variantId] = item.quantity;
        }
      });
      serverQuantitiesRef.current = serverQtys;
      
      // Broadcast instantly to other tabs
      if (shouldBroadcast) {
        socketService.broadcastCartUpdate({ cart: cartData });
      }
    } else {
      setCart(null);
      setItems([]);
      serverQuantitiesRef.current = {};
      
      if (shouldBroadcast) {
        socketService.broadcastCartUpdate({ cart: null });
      }
    }
  }, []);

  const updateItemQuantity = useCallback(
    async (variantId, newQuantity) => {
      if (!variantId) return;
      
      const cartId = cart?._id || cart?.id;
      if (!cartId) return;

      // Store the target quantity
      pendingQuantitiesRef.current[variantId] = newQuantity;

      // Optimistic update - instant UI feedback
      setItems((prevItems) =>
        prevItems.map((item) => {
          const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
          return itemVariantId === variantId ? { ...item, quantity: newQuantity } : item;
        })
      );

      // Clear existing timer
      if (updateTimersRef.current[variantId]) {
        clearTimeout(updateTimersRef.current[variantId]);
      }

      // Debounce the API call
      updateTimersRef.current[variantId] = setTimeout(async () => {
        const targetQty = pendingQuantitiesRef.current[variantId];
        if (targetQty === undefined) return;

        // Use server quantity (not stale closure quantity)
        const serverQty = serverQuantitiesRef.current[variantId] || 0;
        const diff = targetQty - serverQty;
        
        if (diff === 0) {
          delete pendingQuantitiesRef.current[variantId];
          return;
        }

        setItemLoading((prev) => ({ ...prev, [variantId]: true }));

        try {
          let updatedCart;
          if (diff > 0) {
            updatedCart = await addItemToCart({ cartId, variantId, quantity: diff });
          } else {
            updatedCart = await removeItemFromCart(cartId, { variantId, quantity: Math.abs(diff) });
          }
          
          // Update server quantity ref
          serverQuantitiesRef.current[variantId] = targetQty;
          delete pendingQuantitiesRef.current[variantId];
          
          // Use API response directly + broadcast instantly (no refetch!)
          updateCartState(updatedCart);
        } catch (err) {
          console.error("Failed to update quantity:", err);
          setError(err.message || "Failed to update quantity");
          delete pendingQuantitiesRef.current[variantId];
          await fetchCart(true, false);
        } finally {
          setItemLoading((prev) => ({ ...prev, [variantId]: false }));
        }
      }, 300); // Wait 300ms after last change
    },
    [cart, fetchCart, updateCartState]
  );

  const addItem = useCallback(
    async (variantId, quantity = 1) => {
      if (!variantId) return;

      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        const currentCart = await ensureCart();
        const cartId = currentCart._id || currentCart.id;

        const updatedCart = await addItemToCart({ cartId, variantId, quantity });
        // Use API response directly + broadcast instantly (no refetch!)
        updateCartState(updatedCart);
      } catch (err) {
        console.error("Failed to add item:", err);
        setError(err.message || "Failed to add item");
        await fetchCart(true, false);
      } finally {
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [ensureCart, fetchCart, updateCartState]
  );

  const removeItem = useCallback(
    async (variantId, quantity = 1) => {
      const cartId = cart?._id || cart?.id;
      if (!cartId || !variantId) return;

      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        const updatedCart = await removeItemFromCart(cartId, { variantId, quantity });
        // Use API response directly + broadcast instantly (no refetch!)
        updateCartState(updatedCart);
      } catch (err) {
        console.error("Failed to remove item:", err);
        setError(err.message || "Failed to remove item");
        await fetchCart(true, false);
      } finally {
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [cart, fetchCart, updateCartState]
  );

  const removeItemCompletely = useCallback(
    async (variantId) => {
      const currentItem = items.find((item) => {
        const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
        return itemVariantId === variantId;
      });

      if (!currentItem) return;
      await removeItem(variantId, currentItem.quantity);
    },
    [items, removeItem]
  );

  const clearAllItems = useCallback(async () => {
    const cartId = cart?._id || cart?.id;
    if (!cartId) return;

    setLoading(true);
    try {
      const updatedCart = await clearCart(cartId);
      // Use API response directly + broadcast instantly
      updateCartState(updatedCart || { ...cart, items: [] });
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setError(err.message || "Failed to clear cart");
      await fetchCart(true, false);
    } finally {
      setLoading(false);
    }
  }, [cart, fetchCart, updateCartState]);

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // BroadcastChannel - Listen for cart updates from other tabs (same browser only)
  useEffect(() => {
    const handleBroadcastUpdate = (data) => {
      // Use the cart data directly from broadcast (no extra API call)
      if (data?.cart) {
        const cartItems = data.cart.items || [];
        
        // Check if items are populated (objects with product) or just ObjectId strings
        const isPopulated = cartItems.length === 0 || 
          (typeof cartItems[0] === 'object' && cartItems[0] !== null);
        
        if (!isPopulated) {
          fetchCart(true, false); // Silent fetch, no broadcast
          return;
        }
        
        setCart(data.cart);
        setItems(cartItems);
        
        // Update server quantities ref
        const serverQtys = {};
        cartItems.forEach((item) => {
          const variantId = item.variant?._id || item.variant?.id || item.variantId;
          if (variantId) {
            serverQtys[variantId] = item.quantity;
          }
        });
        serverQuantitiesRef.current = serverQtys;
      } else if (data?.cart === null) {
        // Cart was cleared in another tab
        setCart(null);
        setItems([]);
        serverQuantitiesRef.current = {};
      } else {
        // Fallback: refetch if no cart data in broadcast
        fetchCart(true, false); // Silent fetch, no broadcast
      }
    };

    // Subscribe to BroadcastChannel updates (same browser tabs only)
    const unsubscribe = socketService.onCartUpdate(handleBroadcastUpdate);

    return () => {
      unsubscribe();
    };
  }, [fetchCart]);

  // Cart summary
  const cartSummary = {
    itemCount: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    subtotal: items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return sum + price * quantity;
    }, 0),
  };

  const isInCart = useCallback(
    (variantId) => {
      return items.some((item) => {
        const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
        return itemVariantId === variantId;
      });
    },
    [items]
  );

  const getQuantity = useCallback(
    (variantId) => {
      const item = items.find((item) => {
        const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
        return itemVariantId === variantId;
      });
      return item?.quantity || 0;
    },
    [items]
  );

  const getItemVariantId = useCallback((item) => {
    return item?.variant?._id || item?.variant?.id || item?.variantId || null;
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = updateTimersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  return {
    cart,
    items,
    cartItems: items,
    loading,
    error,
    itemLoading,
    addItem,
    removeItem,
    updateItemQuantity,
    removeItemCompletely,
    clearAllItems,
    refetch: fetchCart,
    cartSummary,
    isInCart,
    getQuantity,
    getItemVariantId,
  };
}
