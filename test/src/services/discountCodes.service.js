import apiClient from './config';

/**
 * Discount Codes Service
 * Handles all discount code-related API calls
 */

// Get all discount codes (admin)
export const getAllDiscountCodes = async (params = {}) => {
  const response = await apiClient.get('/discount-codes', { params });
  return response;
};

// Get single discount code by ID
export const getDiscountCodeById = async (id) => {
  const response = await apiClient.get(`/discount-codes/${id}`);
  return response;
};

// Create new discount code (admin)
export const createDiscountCode = async (data) => {
  const response = await apiClient.post('/discount-codes', data);
  return response;
};

// Update discount code (admin)
export const updateDiscountCode = async (id, data) => {
  const response = await apiClient.patch(`/discount-codes/${id}`, data);
  return response;
};

// Delete discount code (admin)
export const deleteDiscountCode = async (id) => {
  const response = await apiClient.delete(`/discount-codes/${id}`);
  return response;
};

// Validate discount code
export const validateDiscountCode = async (code) => {
  const response = await apiClient.post('/discount-codes/validate', { code });
  return response;
};

export default {
  getAllDiscountCodes,
  getDiscountCodeById,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  validateDiscountCode,
};

