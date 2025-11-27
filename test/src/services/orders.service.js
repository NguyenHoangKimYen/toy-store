import apiClient from './config';

/**
 * Orders Service
 * Handles all order-related API calls
 * Backend routes:
 * - GET /orders - Get user's orders (auth required)
 * - GET /orders/:id - Get order detail (auth required)
 * - POST /orders - Create order
 * - POST /orders/checkout/cart - Checkout from cart (auth required)
 * - POST /orders/checkout/cart/guest - Checkout from cart (guest)
 * - PUT /orders/:id/status - Update order status (admin only)
 */

// Get all orders for authenticated user
export const getMyOrders = async (params = {}) => {
  const response = await apiClient.get('/orders', { params });
  return response;
};

// Get all orders (admin only) - using query params to differentiate
export const getAllOrders = async (params = {}) => {
  const response = await apiClient.get('/orders/admin/all', { params });
  return response;
};

// Get single order detail
export const getOrderById = async (orderId) => {
  // Check if user is authenticated
  const token = localStorage.getItem('authToken');
  
  // Use guest endpoint if not authenticated
  const endpoint = token ? `/orders/${orderId}` : `/orders/${orderId}/guest`;
  
  const response = await apiClient.get(endpoint);
  return response;
};

// Create order directly
export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response;
};

// Checkout from cart (authenticated user)
export const checkoutFromCart = async (checkoutData) => {
  // checkoutData should include: addressId, discountCodeId, pointsToUse, voucherId, paymentMethod, deliveryType
  const response = await apiClient.post('/orders/checkout/cart', checkoutData);
  return response;
};

// Checkout from cart (guest)
export const guestCheckoutFromCart = async (checkoutData) => {
  // checkoutData should include: sessionId, guestInfo (fullName, email, phone, addressLine, lat, lng), discountCodeId, pointsToUse
  const response = await apiClient.post('/orders/checkout/cart/guest', checkoutData);
  return response;
};

// Update order status (admin only)
export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.put(`/orders/${orderId}/status`, { status });
  return response;
};

// Cancel order (user/guest can cancel their own pending orders)
export const cancelOrder = async (orderId) => {
  const response = await apiClient.put(`/orders/${orderId}/cancel`);
  return response;
};

// Get orders by discount code ID (admin only)
export const getOrdersByDiscountCode = async (discountCodeId) => {
  const response = await apiClient.get(`/orders/discount/${discountCodeId}`);
  return response;
};

export default {
  getMyOrders,
  getAllOrders,
  getOrderById,
  createOrder,
  checkoutFromCart,
  guestCheckoutFromCart,
  updateOrderStatus,
  cancelOrder,
  getOrdersByDiscountCode,
};
