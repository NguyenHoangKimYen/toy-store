import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';

/**
 * Get user's cart
 * @returns {Promise<Array>} Cart items with populated product details
 */
export const getCart = async () => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CART}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Add item to cart
 * @param {Object} cartItem - Cart item data
 * @returns {Promise<Object>} Added cart item
 */
export const addToCart = async (cartItem) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CART}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cartItem),
  });
  return handleResponse(response);
};

/**
 * Update cart item quantity
 * @param {string} cartItemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart item
 */
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CART}/${cartItemId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantity }),
  });
  return handleResponse(response);
};

/**
 * Remove item from cart
 * @param {string} cartItemId - Cart item ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const removeFromCart = async (cartItemId) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CART}/${cartItemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Clear entire cart
 * @returns {Promise<Object>} Confirmation
 */
export const clearCart = async () => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CART}/clear`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
