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
  const cartItemsRef = useRef([]); // Last known server state
  const serverQuantitiesRef = useRef({}); // variantId -> last confirmed server quantity
  const debouncedUpdateRef = useRef({});
  const pendingQuantityRef = useRef({}); // Track what quantity we're aiming for
  const variantTimestampsRef = useRef({}); // Track timestamps per variant for conflict resolution

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
        
        // Update server quantities ref with confirmed data
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
        cartItemsRef.current = [];
        serverQuantitiesRef.current = {};
      }
    } catch (err) {
      // 404 means no cart exists yet - that's okay
      if (err.response?.status !== 404) {
        setError(err.message || "Failed to fetch cart");
      }
      setCart(null);
      setItems([]);
      cartItemsRef.current = [];
      serverQuantitiesRef.current = {};
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
      serverQuantitiesRef.current = {};
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

    // Get the target quantity from ref
    const targetQty = pendingQuantityRef.current[variantId];
    if (targetQty === undefined) return;

    // Get the CONFIRMED server quantity (not optimistic UI state)
    const serverQty = serverQuantitiesRef.current[variantId];
    if (serverQty === undefined) {
      // Item doesn't exist on server yet - this shouldn't happen for updateItemQuantity
      console.warn(`syncQuantityToBackend: No server quantity for ${variantId}`);
      return;
    }

    const diff = targetQty - serverQty;
    if (diff === 0) {
      delete pendingQuantityRef.current[variantId];
      return;
    }

    console.log(`📤 Syncing ${variantId}: server=${serverQty} → target=${targetQty} (diff=${diff})`);
    setItemLoading((prev) => ({ ...prev, [variantId]: true }));

    // Clear the pending quantity BEFORE making the API call
    // This prevents socket events from arriving while we still have pending state
    delete pendingQuantityRef.current[variantId];

    try {
      if (diff > 0) {
        await addItemToCart({ cartId, variantId, quantity: diff });
      } else {
        await removeItemFromCart(cartId, { variantId, quantity: Math.abs(diff) });
      }
      
      // Update server quantity ref to match what we just sent
      serverQuantitiesRef.current[variantId] = targetQty;
      
      // Also update cartItemsRef for consistency
      const updatedItems = cartItemsRef.current.map((item) => {
        const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
        if (itemVariantId === variantId) {
          return { ...item, quantity: targetQty };
        }
        return item;
      });
      cartItemsRef.current = updatedItems;

      console.log(`✅ Backend synced: ${variantId} = ${targetQty}`);
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError(err.message || "Failed to update quantity");
      // Rollback on error - refetch to get actual server state
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
   * Uses timestamp-based conflict resolution for cross-tab sync
   * @param {string} variantId - The variant ID to update
   * @param {number} newQuantity - New quantity to set
   */
  const updateItemQuantity = useCallback(
    (variantId, newQuantity) => {
      if (!variantId) return;

      // Record timestamp for this update (used for conflict resolution)
      const timestamp = socketService.recordLocalUpdate(variantId);
      variantTimestampsRef.current[variantId] = timestamp;

      // Store the latest target quantity
      pendingQuantityRef.current[variantId] = newQuantity;

      // Instant optimistic UI update
      const updatedItems = items.map((item) => {
        const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
        if (itemVariantId === variantId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      
      setItems(updatedItems);

      // DON'T broadcast immediately - wait for server confirmation
      // The socket event from the server will trigger the broadcast with correct data

      // Clear existing timeout for this variant
      if (debouncedUpdateRef.current[variantId]) {
        clearTimeout(debouncedUpdateRef.current[variantId]);
      }

      // Schedule new sync - it will read the latest value from pendingQuantityRef
      debouncedUpdateRef.current[variantId] = setTimeout(() => {
        syncQuantityToBackend(variantId);
        delete debouncedUpdateRef.current[variantId];
      }, 300);
    },
    [items, syncQuantityToBackend]
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
      serverQuantitiesRef.current = {};
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

    // Listen for cart updates from socket (backend) - these are CONFIRMED server updates
    // When we receive this, the server has already accepted the change, so we should
    // adopt the server's version completely (except for items we're actively editing)
    const handleCartUpdate = (data) => {
      console.log('🔔 [Socket] Cart updated from server:', data?.action);
      
      if (!data.cart) {
        console.log('⚠️ [Socket] No cart data in update');
        return;
      }

      const incomingItems = data.cart.items || [];
      console.log('📦 [Socket] Incoming items:', incomingItems.length);
      
      // Debug: Log each incoming item's product data
      incomingItems.forEach((item, idx) => {
        const productName = item.product?.name || 'NO_PRODUCT';
        const variantId = item.variant?._id || item.variantId || 'NO_VARIANT';
        console.log(`  [${idx}] variantId=${variantId}, product="${productName}"`);
      });

      // Build incoming quantities map
      const incomingQuantities = {};
      incomingItems.forEach((item) => {
        const variantId = item.variant?._id || item.variant?.id || item.variantId;
        if (variantId) {
          incomingQuantities[variantId] = item.quantity;
        }
      });

      // Check if we have any pending local updates that are newer
      const hasPendingUpdates = Object.keys(pendingQuantityRef.current).length > 0;
      
      if (!hasPendingUpdates) {
        // No pending updates - accept server state completely
        console.log('✅ [Socket] No pending updates, accepting server state');
        setCart(data.cart);
        setItems(incomingItems);
        cartItemsRef.current = incomingItems;
        serverQuantitiesRef.current = incomingQuantities;
        
        // Broadcast to other tabs with clean server data
        socketService.broadcastCartUpdate({
          items: incomingItems,
          totalItems: data.cart.totalItems,
        });
      } else {
        // We have pending updates - merge carefully
        console.log('⚠️ [Socket] Has pending updates, merging...');
        console.log('  Pending variants:', Object.keys(pendingQuantityRef.current));
        
        setItems((currentItems) => {
          console.log('  Current items in state:', currentItems.length);
          console.log('  Incoming items from server:', incomingItems.length);
          
          const updatedItems = incomingItems.map((incomingItem) => {
            const variantId = incomingItem.variant?._id || incomingItem.variant?.id || incomingItem.variantId;
            
            console.log(`  Processing variant ${variantId}:`);
            console.log(`    - Has product in incoming? ${!!incomingItem.product}`);
            console.log(`    - Product name in incoming: ${incomingItem.product?.name || 'NONE'}`);
            
            // Find existing item in current items
            const existingItem = currentItems.find((item) => {
              const itemVariantId = item.variant?._id || item.variant?.id || item.variantId;
              return itemVariantId === variantId;
            });
            
            if (existingItem) {
              console.log(`    - Has product in existing? ${!!existingItem.product}`);
              console.log(`    - Product name in existing: ${existingItem.product?.name || 'NONE'}`);
            }
            
            // If we have a pending update for this item, keep our local quantity
            if (variantId && pendingQuantityRef.current[variantId] !== undefined && existingItem) {
              console.log(`🔒 [Socket] Keeping local quantity for ${variantId}: ${existingItem.quantity}`);
              // Merge: use incoming data as base, but keep local quantity and preserve product data if missing
              const merged = {
                ...incomingItem,
                quantity: existingItem.quantity,
                // Preserve product data if incoming doesn't have it
                product: incomingItem.product || existingItem.product,
                variant: incomingItem.variant || existingItem.variant,
              };
              console.log(`    - Final merged product: ${merged.product?.name || 'NONE'}`);
              return merged;
            }
            
            // Accept server version, but preserve existing product/variant if server doesn't have it
            if (variantId) {
              serverQuantitiesRef.current[variantId] = incomingItem.quantity;
            }
            
            // If server returned item without product data, try to keep existing
            if (!incomingItem.product && existingItem?.product) {
              console.log(`    ⚠️ Server missing product, using existing`);
              return {
                ...incomingItem,
                product: existingItem.product,
                variant: incomingItem.variant || existingItem.variant,
              };
            }
            
            console.log(`    ✅ Using server item as-is`);
            return incomingItem;
          });
          
          cartItemsRef.current = updatedItems;
          return updatedItems;
        });
        
        setCart(data.cart);
      }
    };

    socketService.on('cart_updated', handleCartUpdate);

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting socket listener');
      socketService.off('cart_updated', handleCartUpdate);
    };
  }, [userId]); // Only re-run when userId changes

  // BroadcastChannel - Listen for cart updates from other tabs (same browser)
  // Only sync quantity changes, preserve all other item data
  useEffect(() => {
    const handleBroadcast = (data) => {
      console.log('📢 Cart update received from another tab');
      
      if (!data.items || !Array.isArray(data.items)) return;
      
      const incomingTimestamp = data._timestamp || 0;
      const incomingVariantTimestamps = data._variantTimestamps || {};
      
      // Create a map of incoming items by variantId
      const incomingItemsMap = new Map();
      data.items.forEach((item) => {
        const variantId = item.variant?._id || item.variant?.id || item.variantId;
        if (variantId) {
          incomingItemsMap.set(variantId, item);
        }
      });
      
      // Update items: use incoming item data (which has product info) but respect conflict resolution
      setItems((currentItems) => {
        // If no current items but incoming has items, we need to refetch
        if (currentItems.length === 0 && data.items.length > 0) {
          console.log('📢 No local items, will refetch from server');
          // Don't update state here, trigger a refetch instead
          return currentItems;
        }
        
        const updatedItems = currentItems.map((item) => {
          const variantId = item.variant?._id || item.variant?.id || item.variantId;
          if (!variantId) return item;
          
          const incomingItem = incomingItemsMap.get(variantId);
          if (!incomingItem) return item;
          
          const localTimestamp = variantTimestampsRef.current[variantId] || 0;
          const remoteTimestamp = incomingVariantTimestamps[variantId] || incomingTimestamp;
          
          // If local has a newer pending update, keep local version
          if (pendingQuantityRef.current[variantId] !== undefined && localTimestamp >= remoteTimestamp) {
            console.log(`🔒 Keeping local quantity for ${variantId}`);
            return item;
          }
          
          // Accept remote item (includes product, variant, quantity, etc.)
          console.log(`✅ Updating item for ${variantId}: qty ${item.quantity} → ${incomingItem.quantity}`);
          
          // Update server quantity ref
          serverQuantitiesRef.current[variantId] = incomingItem.quantity;
          
          // Clear pending updates for this variant
          delete pendingQuantityRef.current[variantId];
          if (debouncedUpdateRef.current[variantId]) {
            clearTimeout(debouncedUpdateRef.current[variantId]);
            delete debouncedUpdateRef.current[variantId];
          }
          
          // Use incoming item but preserve product/variant if missing
          return {
            ...incomingItem,
            product: incomingItem.product || item.product,
            variant: incomingItem.variant || item.variant,
          };
        });
        
        cartItemsRef.current = updatedItems;
        return updatedItems;
      });
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
