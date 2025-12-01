import apiClient from './config';

/**
 * Shipping Service
 * Handles all shipping-related API calls
 */

// Get available delivery types
export const getDeliveryTypes = async (region = null) => {
  const params = region ? { region } : {};
  const response = await apiClient.get('/shipping/delivery-types', { params });
  return response;
};

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
  getDeliveryTypes,
  getShippingFee,
  getShippingFeeByUser,
};
