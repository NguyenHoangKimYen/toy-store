import apiClient from './config';

/**
 * Discount Codes Service
 * Handles all discount code-related API calls
 */

// Get all discount codes (admin)
export const getAllDiscountCodes = async (params = {}) => {
  const response = await apiClient.get('/discount', { params });
  return response;
};

// Get single discount code by ID
export const getDiscountCodeById = async (id) => {
  const response = await apiClient.get(`/discount/${id}`);
  return response;
};

// Create new discount code (admin)
export const createDiscountCode = async (data) => {
  const response = await apiClient.post('/discount', data);
  return response;
};

// Update discount code (admin)
export const updateDiscountCode = async (id, data) => {
  const response = await apiClient.put(`/discount/${id}`, data);
  return response;
};

// Delete discount code (admin)
export const deleteDiscountCode = async (id) => {
  const response = await apiClient.delete(`/discount/${id}`);
  return response;
};

// Validate discount code
export const validateDiscountCode = async (code, totalAmount) => {
  try {
    const response = await apiClient.post('/discount/validate', { 
      code: code.toUpperCase().trim(), 
      totalAmount 
    });
    
    // Backend returns { success: true, data: { discountCodeId, discountValue, finalAmount, ... } }
    if (response.success && response.data) {
      return {
        valid: true,
        discountAmount: response.data.discountValue,
        finalAmount: response.data.finalAmount,
        discountCode: response.data,
      };
    }
    
    return {
      valid: false,
      message: 'Invalid discount code',
    };
  } catch (error) {
    // Handle backend error messages
    const errorMessage = error.message || 'Invalid discount code';
    
    const errorMessages = {
      'DISCOUNT_NOT_FOUND': 'Discount code not found',
      'DISCOUNT_EXPIRED': 'This discount code has expired',
      'DISCOUNT_USAGE_LIMIT': 'This discount code has reached its usage limit',
      'DISCOUNT_TIER_NOT_ELIGIBLE': 'You are not eligible for this discount code',
    };
    
    return {
      valid: false,
      message: errorMessages[errorMessage] || errorMessage,
    };
  }
};

export default {
  getAllDiscountCodes,
  getDiscountCodeById,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  validateDiscountCode,
};

