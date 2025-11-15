import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse, createUrl } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';

/**
 * Get all orders for the authenticated user
 * @param {Object} params - Query parameters (status, sort, search)
 * @returns {Promise<Array>} Array of orders
 */
export const getOrders = async (params = {}) => {
  const url = createUrl(`${API_BASE_URL}${ENDPOINTS.ORDERS}`, params);
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get a single order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrderById = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order
 */
export const createOrder = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });
  return handleResponse(response);
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}/${orderId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Updated order
 */
export const cancelOrder = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}/${orderId}/cancel`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
