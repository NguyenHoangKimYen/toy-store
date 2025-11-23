import apiClient from './config';

/**
 * Cart Service
 * Handles all cart-related API calls
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

// Cart Item operations
export const createCartItem = async (cartItemData) => {
  return await apiClient.post('/cart-items', cartItemData);
};

export const getCartItems = async (cartId) => {
  return await apiClient.get(`/cart-items/cart/${cartId}`);
};

export const updateCartItem = async (cartItemId, cartItemData) => {
  return await apiClient.put(`/cart-items/${cartItemId}`, cartItemData);
};

export const deleteCartItem = async (cartItemId) => {
  return await apiClient.delete(`/cart-items/${cartItemId}`);
};

export default {
  getAllCarts,
  getCartByUser,
  getCartBySession,
  createCart,
  clearCart,
  deleteCart,
  createCartItem,
  getCartItems,
  updateCartItem,
  deleteCartItem,
};
