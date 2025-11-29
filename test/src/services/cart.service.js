import apiClient from './config';

/**
 * Cart Service
 * Handles all cart-related API calls
 * 
 * Backend endpoints:
 * - GET /carts/user/:userId - Get cart by user ID (auth required)
 * - GET /carts/session/:sessionId - Get cart by session ID (guest)
 * - POST /carts - Create new cart
 * - POST /carts/:cartId/items - Add item to cart
 * - POST /carts/:cartId/remove-item - Remove/decrease item from cart
 * - DELETE /carts/:cartId/clear - Clear all items
 * - DELETE /carts/:cartId - Delete cart (admin only)
 */

// Get all carts (admin only)
export const getAllCarts = async () => {
  return await apiClient.get('/carts');
};

// Get cart by user ID
export const getCartByUser = async (userId) => {
  return await apiClient.get(`/carts/user/${userId}`);
};

// Get cart by session ID (for guests)
export const getCartBySession = async (sessionId) => {
  return await apiClient.get(`/carts/session/${sessionId}`);
};

// Create cart
export const createCart = async (cartData) => {
  return await apiClient.post('/carts', cartData);
};

// Clear cart
export const clearCart = async (cartId) => {
  return await apiClient.delete(`/carts/${cartId}/clear`);
};

// Delete cart
export const deleteCart = async (cartId) => {
  return await apiClient.delete(`/carts/${cartId}`);
};

/**
 * Add item to cart
 * @param {Object} itemData - { cartId, variantId, quantity, userId? }
 * @returns {Promise<Object>} - Updated cart with items
 */
export const addItemToCart = async (itemData) => {
  const { cartId, ...data } = itemData;
  const response = await apiClient.post(`/carts/${cartId}/items`, data);
  // Backend returns { success: true, data: cart }
  return response.data || response;
};

/**
 * Remove/decrease item from cart
 * @param {string} cartId - Cart ID
 * @param {Object} itemData - { variantId, quantity, userId? }
 * @returns {Promise<Object>} - Updated cart
 */
export const removeItemFromCart = async (cartId, itemData) => {
  const response = await apiClient.post(`/carts/${cartId}/remove-item`, itemData);
  return response;
};

/**
 * Get cart items (populated from cart response)
 * The backend returns cart.items already populated
 */
export const getCartItems = async (cartId) => {
  // Cart items are included in the cart response from getCartByUser/getCartBySession
  // This function is for backwards compatibility
  const cart = await apiClient.get(`/carts/session/${cartId}`).catch(() => null);
  return cart?.items || [];
};

// Legacy functions for backwards compatibility with existing useCart hook
// These map to the new consolidated endpoints

export const createCartItem = async (cartItemData) => {
  const { cartId, ...data } = cartItemData;
  return await addItemToCart({ cartId, ...data });
};

// eslint-disable-next-line no-unused-vars
export const updateCartItem = async (_cartItemId, _cartItemData) => {
  // The new backend doesn't have a direct update endpoint
  // Updates happen through add/remove item logic
  // For now, we'll need to use add-item to increase or remove-item to decrease
  console.warn('updateCartItem: Backend uses add/remove instead of direct update');
  // This is a stub - the useCart hook should be updated to use addItemToCart/removeItemFromCart
  throw new Error('Use addItemToCart or removeItemFromCart instead');
};

// eslint-disable-next-line no-unused-vars
export const deleteCartItem = async (_cartItemId) => {
  // The new backend doesn't have a direct delete by item ID
  // Need variantId and cartId to remove
  console.warn('deleteCartItem: Backend requires cartId and variantId');
  throw new Error('Use removeItemFromCart with cartId and variantId instead');
};

export default {
  getAllCarts,
  getCartByUser,
  getCartBySession,
  createCart,
  clearCart,
  deleteCart,
  addItemToCart,
  removeItemFromCart,
  getCartItems,
  // Legacy exports
  createCartItem,
  updateCartItem,
  deleteCartItem,
};
