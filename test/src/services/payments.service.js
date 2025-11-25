import apiClient from './config';

/**
 * Payment Service
 * Handles all payment-related API calls
 */

// ===================== VIETQR =====================

// Get VietQR code for an order
export const getVietQR = async (orderId) => {
  const response = await apiClient.get(`/payments/vietqr/${orderId}`);
  return response;
};

// Customer confirms payment (clicked "I've transferred")
export const customerConfirmVietQR = async (orderId) => {
  const response = await apiClient.post(`/payments/vietqr/customer-confirm/${orderId}`);
  return response.data;
};

// Admin: Get pending VietQR orders
export const getPendingVietQROrders = async () => {
  const response = await apiClient.get('/payments/vietqr/admin/pending');
  return response.data;
};

// Admin: Confirm payment received
export const adminConfirmVietQR = async (orderId) => {
  const response = await apiClient.post(`/payments/vietqr/admin/${orderId}/confirm`);
  return response.data;
};

// Admin: Reject payment
export const adminRejectVietQR = async (orderId) => {
  const response = await apiClient.post(`/payments/vietqr/admin/${orderId}/reject`);
  return response.data;
};

// ===================== MOMO =====================

// Create MoMo payment
export const createMomoPayment = async (orderId) => {
  const response = await apiClient.post(`/payments/momo/${orderId}`);
  return response;
};

// MoMo IPN (backend callback)
export const momoIpn = async (data) => {
  const response = await apiClient.post('/payments/momo/ipn', data);
  return response.data;
};

// MoMo return URL handler
export const momoReturn = async (params) => {
  const response = await apiClient.get('/payments/momo/return', { params });
  return response.data;
};

// ===================== ZALOPAY =====================

// Create ZaloPay order
export const createZaloPayOrder = async (orderId) => {
  const response = await apiClient.post(`/payments/zalopay/${orderId}`);
  return response;
};

// ZaloPay callback (backend callback)
export const zaloPayCallback = async (data) => {
  const response = await apiClient.post('/payments/zalopay/callback', data);
  return response.data;
};

// ZaloPay return URL handler
export const zaloPayReturn = async (params) => {
  const response = await apiClient.get('/payments/zalopay/return', { params });
  return response;
};

export default {
  getVietQR,
  customerConfirmVietQR,
  getPendingVietQROrders,
  adminConfirmVietQR,
  adminRejectVietQR,
  createMomoPayment,
  momoIpn,
  momoReturn,
  createZaloPayOrder,
  zaloPayCallback,
  zaloPayReturn,
};
