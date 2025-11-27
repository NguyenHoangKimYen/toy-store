import apiClient from './config';

/**
 * Shipping Service
 * Handles all shipping-related API calls
 */

// Calculate shipping fee for guest (no login required)
export const getShippingFee = async (params) => {
  const response = await apiClient.post('/shipping/fee', params);
  return response;
};

// Calculate shipping fee for logged-in user
export const getShippingFeeByUser = async (userId, params = {}) => {
  const response = await apiClient.get(`/shipping/fee/${userId}`, { params });
  return response;
};

export default {
  getShippingFee,
  getShippingFeeByUser,
};
