import { useState, useEffect, useCallback, useRef } from "react";
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

  const fetchCart = useCallback(async (silent = false) => {
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
      } else {
        setCart(null);
        setItems([]);
        serverQuantitiesRef.current = {};
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
          if (diff > 0) {
            await addItemToCart({ cartId, variantId, quantity: diff });
          } else {
            await removeItemFromCart(cartId, { variantId, quantity: Math.abs(diff) });
          }
          
          // Update server quantity ref
          serverQuantitiesRef.current[variantId] = targetQty;
          delete pendingQuantitiesRef.current[variantId];
          // Socket will trigger refetch for all devices
        } catch (err) {
          console.error("Failed to update quantity:", err);
          setError(err.message || "Failed to update quantity");
          delete pendingQuantitiesRef.current[variantId];
          await fetchCart(true);
        } finally {
          setItemLoading((prev) => ({ ...prev, [variantId]: false }));
        }
      }, 300); // Wait 300ms after last change
    },
    [cart, fetchCart]
  );

  const addItem = useCallback(
    async (variantId, quantity = 1) => {
      if (!variantId) return;

      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        const currentCart = await ensureCart();
        const cartId = currentCart._id || currentCart.id;

        await addItemToCart({ cartId, variantId, quantity });
        await fetchCart(true);
      } catch (err) {
        console.error("Failed to add item:", err);
        setError(err.message || "Failed to add item");
        await fetchCart(true);
      } finally {
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [ensureCart, fetchCart]
  );

  const removeItem = useCallback(
    async (variantId, quantity = 1) => {
      const cartId = cart?._id || cart?.id;
      if (!cartId || !variantId) return;

      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        await removeItemFromCart(cartId, { variantId, quantity });
        await fetchCart(true);
      } catch (err) {
        console.error("Failed to remove item:", err);
        setError(err.message || "Failed to remove item");
        await fetchCart(true);
      } finally {
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [cart, fetchCart]
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
      await clearCart(cartId);
      setItems([]);
      await fetchCart(true);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setError(err.message || "Failed to clear cart");
      await fetchCart(true);
    } finally {
      setLoading(false);
    }
  }, [cart, fetchCart]);

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Socket.io - Listen for updates from other devices
  useEffect(() => {
    if (!userId) return;

    socketService.connect(userId);

    const handleCartUpdate = (data) => {
      // Use the cart data directly from socket (no extra API call)
      if (data?.cart) {
        const cartItems = data.cart.items || [];
        
        // Check if items are populated (objects with product) or just ObjectId strings
        const isPopulated = cartItems.length === 0 || 
          (typeof cartItems[0] === 'object' && cartItems[0] !== null);
        
        if (!isPopulated) {
          fetchCart(true);
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
      } else {
        // Fallback: refetch if no cart data in socket
        fetchCart(true);
      }
    };

    socketService.on('cart_updated', handleCartUpdate);

    return () => {
      socketService.off('cart_updated', handleCartUpdate);
    };
  }, [userId, fetchCart]);

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
