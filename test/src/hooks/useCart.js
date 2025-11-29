import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  getCartByUserId,
  getCartBySessionId,
  createCart,
  addItemToCart,
  removeItemFromCart,
  clearCart,
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
  const updateTimeoutsRef = useRef({});

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
   */
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let cartData = null;

      if (userId) {
        cartData = await getCartByUserId(userId);
      } else {
        const sessionId = getSessionId();
        cartData = await getCartBySessionId(sessionId);
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

        // Call API to add item
        const updatedCart = await addItemToCart({
          cartId: currentCart._id,
          variantId,
          quantity,
        });

        // Update state with response
        if (updatedCart) {
          setCart(updatedCart);
          const cartItems = updatedCart.items || [];
          setItems(cartItems);
          cartItemsRef.current = cartItems;
        }
      } catch (err) {
        console.error("Failed to add item to cart:", err);
        setError(err.message || "Failed to add item to cart");
        // Refresh cart to get accurate state
        await fetchCart();
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
      if (!cart?._id || !variantId) {
        console.error("removeItem: cart and variantId are required");
        return;
      }

      setItemLoading((prev) => ({ ...prev, [variantId]: true }));

      try {
        const updatedCart = await removeItemFromCart(cart._id, {
          variantId,
          quantity,
        });

        if (updatedCart) {
          setCart(updatedCart);
          const cartItems = updatedCart.items || [];
          setItems(cartItems);
          cartItemsRef.current = cartItems;
        }
      } catch (err) {
        console.error("Failed to remove item from cart:", err);
        setError(err.message || "Failed to remove item from cart");
        await fetchCart();
      } finally {
        setItemLoading((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [cart, fetchCart]
  );

  /**
   * Update item quantity (replaces the quantity entirely)
   * @param {string} variantId - The variant ID to update
   * @param {number} newQuantity - New quantity to set
   */
  const updateItemQuantity = useCallback(
    async (variantId, newQuantity) => {
      if (!cart?._id || !variantId) {
        console.error("updateItemQuantity: cart and variantId are required");
        return;
      }

      // Find current item
      const currentItem = items.find((item) => {
        const itemVariantId =
          typeof item.variantId === "object"
            ? item.variantId._id
            : item.variantId;
        return itemVariantId === variantId;
      });

      if (!currentItem) {
        console.error("updateItemQuantity: item not found");
        return;
      }

      const currentQuantity = currentItem.quantity;
      const diff = newQuantity - currentQuantity;

      // Cancel any pending update for this variant
      if (updateTimeoutsRef.current[variantId]) {
        clearTimeout(updateTimeoutsRef.current[variantId]);
      }

      // Optimistic update
      setItems((prevItems) =>
        prevItems.map((item) => {
          const itemVariantId =
            typeof item.variantId === "object"
              ? item.variantId._id
              : item.variantId;
          if (itemVariantId === variantId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );

      // Debounce the API call
      updateTimeoutsRef.current[variantId] = setTimeout(async () => {
        setItemLoading((prev) => ({ ...prev, [variantId]: true }));

        try {
          let updatedCart;
          if (diff > 0) {
            // Need to add more items
            updatedCart = await addItemToCart({
              cartId: cart._id,
              variantId,
              quantity: diff,
            });
          } else if (diff < 0) {
            // Need to remove items
            updatedCart = await removeItemFromCart(cart._id, {
              variantId,
              quantity: Math.abs(diff),
            });
          }

          if (updatedCart) {
            setCart(updatedCart);
            const cartItems = updatedCart.items || [];
            setItems(cartItems);
            cartItemsRef.current = cartItems;
          }
        } catch (err) {
          console.error("Failed to update item quantity:", err);
          setError(err.message || "Failed to update quantity");
          // Rollback on error
          await fetchCart();
        } finally {
          setItemLoading((prev) => ({ ...prev, [variantId]: false }));
        }
      }, 500); // 500ms debounce
    },
    [cart, items, fetchCart]
  );

  /**
   * Remove item completely from cart (remove all quantity)
   * @param {string} variantId - The variant ID to remove completely
   */
  const removeItemCompletely = useCallback(
    async (variantId) => {
      if (!cart?._id || !variantId) {
        console.error("removeItemCompletely: cart and variantId are required");
        return;
      }

      // Find current item to get its quantity
      const currentItem = items.find((item) => {
        const itemVariantId =
          typeof item.variantId === "object"
            ? item.variantId._id
            : item.variantId;
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
    if (!cart?._id) {
      console.error("clearAllItems: no cart exists");
      return;
    }

    setLoading(true);
    try {
      await clearCart(cart._id);
      setItems([]);
      cartItemsRef.current = [];
      // Refresh cart to get updated state
      await fetchCart();
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setError(err.message || "Failed to clear cart");
      await fetchCart();
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
   */
  const getItemVariantId = useCallback((item) => {
    if (!item) return null;
    return typeof item.variantId === "object"
      ? item.variantId._id
      : item.variantId;
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

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeouts = updateTimeoutsRef.current;
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

    // Computed
    cartSummary,
    isInCart,
    getQuantity,
    getItemVariantId,
  };
}
