import apiClient from './config';

/**
 * Cart Service
 * Handles all cart-related API calls
 */

// Get all carts (admin only)
export const getAllCarts = async () => {
  const response = await apiClient.get('/carts');
  return response.data;
};

// Get cart by user ID
export const getCartByUser = async (userId) => {
  const response = await apiClient.get(`/carts/user/${userId}`);
  return response.data;
};

// Get cart by session ID (for guests)
export const getCartBySession = async (sessionId) => {
  const response = await apiClient.get(`/carts/session/${sessionId}`);
  return response.data;
};

// Create cart
export const createCart = async (cartData) => {
  const response = await apiClient.post('/carts', cartData);
  return response.data;
};

// Clear cart
export const clearCart = async (cartId) => {
  const response = await apiClient.delete(`/carts/${cartId}/clear`);
  return response.data;
};

// Delete cart
export const deleteCart = async (cartId) => {
  const response = await apiClient.delete(`/carts/${cartId}`);
  return response.data;
};

// Cart Item operations
export const createCartItem = async (cartItemData) => {
  const response = await apiClient.post('/cart-items', cartItemData);
  return response.data;
};

export const getCartItems = async (cartId) => {
  const response = await apiClient.get(`/cart-items/cart/${cartId}`);
  return response.data;
};

export const updateCartItem = async (cartItemId, cartItemData) => {
  const response = await apiClient.put(`/cart-items/${cartItemId}`, cartItemData);
  return response.data;
};

export const deleteCartItem = async (cartItemId) => {
  const response = await apiClient.delete(`/cart-items/${cartItemId}`);
  return response.data;
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
