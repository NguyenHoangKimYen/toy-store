import apiClient from './config';

/**
 * Orders Service
 * Handles all order-related API calls
 */

// Get all orders for authenticated user
export const getMyOrders = async (params = {}) => {
  const response = await apiClient.get('/orders/me', { params });
  return response.data;
};

// Get all orders (admin only)
export const getAllOrders = async (params = {}) => {
  const response = await apiClient.get('/orders', { params });
  return response.data;
};

// Get single order detail
export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
};

// Create order
export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

// Create order for guest
export const createGuestOrder = async (orderData) => {
  const response = await apiClient.post('/orders/guest', orderData);
  return response.data;
};

// Checkout from cart (authenticated user)
export const checkoutFromCart = async (checkoutData) => {
  const response = await apiClient.post('/orders/checkout/cart', checkoutData);
  return response.data;
};

// Checkout from cart (guest)
export const guestCheckoutFromCart = async (checkoutData) => {
  const response = await apiClient.post('/orders/guest/checkout/cart', checkoutData);
  return response.data;
};

// Update order status (admin only)
export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

// Cancel order
export const cancelOrder = async (orderId) => {
  return updateOrderStatus(orderId, 'cancelled');
};

export default {
  getMyOrders,
  getAllOrders,
  getOrderById,
  createOrder,
  createGuestOrder,
  checkoutFromCart,
  guestCheckoutFromCart,
  updateOrderStatus,
  cancelOrder,
};
