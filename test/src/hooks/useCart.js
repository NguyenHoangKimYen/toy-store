import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCartByUser,
  getCartBySession,
  createCart,
  addItemToCart,
  removeItemFromCart,
  clearCart,
} from "@/services";

/**
 * Cart Hook - Refactored to prevent race conditions
 * - Uses requestId to ignore stale responses
 * - Locks cart mode (guest/user) to prevent overwrite
 * - Only fetches when auth is stable
 */
export function useCart(userId = null, authLoading = false) {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemLoading, setItemLoading] = useState({});
  
  // Store userId in ref to avoid stale closure
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  
  // Request tracking to prevent race conditions
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const fetchCartRef = useRef(null);
  
  // Cart mode lock: once we fetch with userId/sessionId, lock it
  const cartModeRef = useRef(null); // 'user' | 'guest' | null
  const lockedUserIdRef = useRef(null);
  const lockedSessionIdRef = useRef(null);

  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  }, []);

  const fetchCart = useCallback(async (silent = false, forceMode = null) => {
    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Generate unique request ID
    const currentRequestId = ++requestIdRef.current;
    
    if (!silent) setLoading(true);
    setError(null);
    
    try {
      let cartData = null;
      // Use ref to get latest userId (avoid stale closure)
      const currentUserId = userIdRef.current;
      const currentMode = forceMode || (currentUserId ? 'user' : 'guest');
      const currentSessionId = getSessionId();
      
      console.log(`[useCart] 🔍 Fetching cart [requestId=${currentRequestId}, mode=${currentMode}, userId=${currentUserId}, sessionId=${currentSessionId}]`);
      console.log(`[useCart] 🔒 Cart mode lock status: ${cartModeRef.current}, lockedUserId=${lockedUserIdRef.current}, lockedSessionId=${lockedSessionIdRef.current}`);
      
      if (currentUserId) {
        console.log(`[useCart] 📡 Calling getCartByUser(${currentUserId})`);
        cartData = await getCartByUser(currentUserId);
      } else {
        console.log(`[useCart] 📡 Calling getCartBySession(${currentSessionId})`);
        cartData = await getCartBySession(currentSessionId);
      }

      console.log(`[useCart] ✅ Response received:`, cartData ? `${cartData.items?.length || 0} items` : 'null');

      // Check if this response is still relevant
      if (currentRequestId !== requestIdRef.current) {
        console.warn(`[useCart] ⚠️ Ignoring stale response [requestId=${currentRequestId}, current=${requestIdRef.current}]`);
        return;
      }
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        console.warn(`[useCart] ⚠️ Request aborted [requestId=${currentRequestId}]`);
        return;
      }

      // Lock cart mode on first successful fetch
      if (cartData && !cartModeRef.current) {
        cartModeRef.current = currentMode;
        if (currentMode === 'user') {
          lockedUserIdRef.current = currentUserId;
        } else {
          lockedSessionIdRef.current = currentSessionId;
        }
        console.log(`[useCart] 🔒 Cart mode locked to ${currentMode}`);
      }

      if (cartData) {
        console.log(`[useCart] 💾 Setting cart with ${cartData.items?.length || 0} items`);
        setCart(cartData);
        setItems(cartData.items || []);
      } else {
        console.log(`[useCart] ⚠️ No cart data, setting empty cart`);
        setCart(null);
        setItems([]);
      }
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        console.log(`[useCart] Request aborted [requestId=${currentRequestId}]`);
        return;
      }
      
      // Check if this response is still relevant
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      
      // 404 is expected when cart doesn't exist yet - don't treat as error
      const is404 = err.message?.includes('404') || 
                    err.message?.includes('Cart not found') || 
                    err.message?.includes('Không tìm thấy');
      
      if (!is404) {
        console.error("Failed to fetch cart:", err);
        setError(err.message || "Failed to fetch cart");
      }
      
      // Set empty cart on any error (including 404)
      setCart(null);
      setItems([]);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [getSessionId]); // Removed userId - it's captured in closure
  
  // Store fetchCart in ref for stable reference
  fetchCartRef.current = fetchCart;

  const ensureCart = useCallback(async () => {
    if (cart) return cart;

    const currentUserId = userIdRef.current;
    const cartData = {
      userId: currentUserId || null,
      sessionId: currentUserId ? null : getSessionId(),
    };
    const newCart = await createCart(cartData);
    setCart(newCart);
    setItems([]);
    return newCart;
  }, [cart, getSessionId]);

  const updateItemQuantity = useCallback(
    async (variantId, newQuantity) => {
      if (!variantId || newQuantity < 0) return;
      
      const cartId = cart?._id || cart?.id;
      if (!cartId) return;

      // Prevent duplicate calls - if already loading, skip
      if (itemLoading[variantId]) {
        console.log('[useCart] ⚠️ Already updating this item, skipping...', { variantId, itemLoading });
        return;
      }

      console.log('[useCart] 🔓 Setting itemLoading[' + variantId + '] = true');
      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        const currentItem = items.find(item => {
          const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
          return String(itemVariantId) === String(variantId);
        });
        
        const currentQty = currentItem?.quantity || 0;
        const diff = newQuantity - currentQty;

        if (diff === 0) {
          setItemLoading((prev) => ({ ...prev, [variantId]: false }));
          return;
        }

        console.log(`[useCart] 🔄 Updating quantity: variantId=${variantId}, from ${currentQty} to ${newQuantity}`);

        // Call API and use response directly (no optimistic update to avoid race conditions)
        let updatedCart;
        if (newQuantity === 0) {
          updatedCart = await removeItemFromCart(cartId, { variantId, quantity: currentQty });
        } else if (diff > 0) {
          updatedCart = await addItemToCart({ cartId, variantId, quantity: diff });
        } else {
          updatedCart = await removeItemFromCart(cartId, { variantId, quantity: Math.abs(diff) });
        }

        // Update state with server response
        if (updatedCart) {
          console.log(`[useCart] ✅ Server response: ${updatedCart.items?.length || 0} items`);
          // Visual feedback for debugging
          document.title = `✅ Updated: ${updatedCart.items?.length} items`;
          setCart(updatedCart);
          setItems(updatedCart.items || []);
        }
      } catch (err) {
        console.error("[useCart] ❌ Failed to update quantity:", err);
        setError(err.message || "Failed to update quantity");
        // Revert on error
        await fetchCartRef.current(true);
      } finally {
        console.log('[useCart] 🔓 Clearing itemLoading[' + variantId + ']');
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [cart, items, itemLoading]
  );

  const addItem = useCallback(
    async (variantId, quantity = 1) => {
      if (!variantId) return;

      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        const currentCart = await ensureCart();
        const cartId = currentCart._id || currentCart.id;

        // Backend returns updated cart
        const updatedCart = await addItemToCart({ cartId, variantId, quantity });
        if (updatedCart) {
          setCart(updatedCart);
          setItems(updatedCart.items || []);
        }
      } catch (err) {
        console.error("Failed to add item:", err);
        setError(err.message || "Failed to add item");
        await fetchCartRef.current(true); // Only fetch on error
      } finally {
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [ensureCart]
  );

  const removeItem = useCallback(
    async (variantId, quantity = 1) => {
      const cartId = cart?._id || cart?.id;
      if (!cartId || !variantId) return;

      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        console.log(`[useCart] ➖ Removing item: variantId=${variantId}, quantity=${quantity}`);
        
        // Use server response directly (no optimistic update)
        const updatedCart = await removeItemFromCart(cartId, { variantId, quantity });
        if (updatedCart) {
          console.log(`[useCart] ✅ Server response: ${updatedCart.items?.length || 0} items`);
          setCart(updatedCart);
          setItems(updatedCart.items || []);
        }
      } catch (err) {
        console.error("Failed to remove item:", err);
        setError(err.message || "Failed to remove item");
        await fetchCartRef.current(true); // Revert on error
      } finally {
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [cart]
  );

  const removeItemCompletely = useCallback(
    async (variantId) => {
      const cartId = cart?._id || cart?.id;
      if (!cartId || !variantId) return;

      const currentItem = items.find((item) => {
        const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
        return String(itemVariantId) === String(variantId);
      });

      if (!currentItem) return;

      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        console.log(`[useCart] 🗑️ Removing item completely: variantId=${variantId}`);
        
        // Use server response directly (no optimistic update)
        const updatedCart = await removeItemFromCart(cartId, { variantId, quantity: currentItem.quantity });
        if (updatedCart) {
          console.log(`[useCart] ✅ Server response: ${updatedCart.items?.length || 0} items`);
          setCart(updatedCart);
          setItems(updatedCart.items || []);
        }
      } catch (err) {
        console.error("Failed to remove item:", err);
        setError(err.message || "Failed to remove item");
        await fetchCartRef.current(true); // Revert on error
      } finally {
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [cart, items]
  );

  const clearAllItems = useCallback(async () => {
    const cartId = cart?._id || cart?.id;
    if (!cartId) return;

    setLoading(true);
    try {
      console.log('[useCart] 🧹 Clearing all items');
      
      // Use server response directly (no optimistic update)
      const clearedCart = await clearCart(cartId);
      if (clearedCart) {
        console.log('[useCart] ✅ Cart cleared');
        setCart(clearedCart);
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setError(err.message || "Failed to clear cart");
      await fetchCartRef.current(true); // Revert on error
    } finally {
      setLoading(false);
    }
  }, [cart]);

  // Initial fetch - wait for auth to be ready, then fetch cart
  // Use stable ref to track if we've already fetched for this user/guest session
  const hasFetchedRef = useRef(false);
  const lastUserIdRef = useRef(userId);
  
  useEffect(() => {
    console.log(`[useCart] 🔄 useEffect triggered: authLoading=${authLoading}, userId=${userId}, hasFetched=${hasFetchedRef.current}`);
    
    // Don't fetch cart while auth is still loading
    if (authLoading) {
      console.log('[useCart] ⏳ Waiting for auth to complete...');
      return;
    }
    
    // Detect userId change (login/logout)
    const userIdChanged = lastUserIdRef.current !== userId;
    
    if (userIdChanged) {
      console.log(`[useCart] 🔄 UserId changed from ${lastUserIdRef.current} to ${userId}, resetting cart mode`);
      lastUserIdRef.current = userId;
      hasFetchedRef.current = false;
      
      // Reset cart mode lock when user changes
      cartModeRef.current = null;
      lockedUserIdRef.current = null;
      lockedSessionIdRef.current = null;
    }
    
    // Only fetch if we haven't fetched for this user/guest session
    if (!hasFetchedRef.current) {
      console.log('[useCart] ✅ Auth ready, fetching cart for userId:', userId || 'guest');
      hasFetchedRef.current = true;
      fetchCartRef.current();
    } else {
      console.log('[useCart] ⏭️ Already fetched, skipping...');
    }
  }, [authLoading, userId]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
    refetch: () => fetchCartRef.current(),
    cartSummary,
    isInCart,
    getQuantity,
    getItemVariantId,
  };
}
