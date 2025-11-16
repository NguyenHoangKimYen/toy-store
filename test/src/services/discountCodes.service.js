import { API_BASE_URL } from './config';
import { handleResponse } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';

/**
 * Validate a discount code
 * @param {string} code - Discount code to validate
 * @param {number} orderTotal - Optional order total to calculate discount
 * @returns {Promise<Object>} - Validation result with discount details
 */
export const validateDiscountCode = async (code, orderTotal = null) => {
  const url = `${API_BASE_URL}/api/discount-codes/validate`;
  
  if (!code || typeof code !== 'string') {
    throw new Error('Discount code is required');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      code: code.trim().toUpperCase(),
      orderTotal 
    }),
  });

  return handleResponse(response);
};

/**
 * Get all discount codes
 * @param {boolean} availableOnly - Only get codes with remaining uses
 * @returns {Promise<Object>} - List of discount codes
 */
export const getDiscountCodes = async (availableOnly = false) => {
  const params = new URLSearchParams();
  if (availableOnly) {
    params.append('available', 'true');
  }

  const url = `${API_BASE_URL}/api/discount-codes${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get a specific discount code by code string
 * @param {string} code - Discount code
 * @returns {Promise<Object>} - Discount code details
 */
export const getDiscountCode = async (code) => {
  if (!code) {
    throw new Error('Discount code is required');
  }

  const url = `${API_BASE_URL}/api/discount-codes/${code.trim().toUpperCase()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Apply/use a discount code (increments usage count)
 * @param {string} codeId - Discount code ID
 * @returns {Promise<Object>} - Updated discount code
 */
export const useDiscountCode = async (codeId) => {
  if (!codeId) {
    throw new Error('Discount code ID is required');
  }

  const url = `${API_BASE_URL}/api/discount-codes/${codeId}/use`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Calculate discount amount
 * @param {number} discountValue - Discount value from code
 * @param {number} orderTotal - Order total amount
 * @returns {number} - Discount amount (cannot exceed order total)
 */
export const calculateDiscount = (discountValue, orderTotal) => {
  const discount = parseFloat(discountValue);
  return Math.min(discount, orderTotal);
};

/**
 * Format discount code for display
 * @param {string} code - Discount code
 * @returns {string} - Formatted code (uppercase, trimmed)
 */
export const formatDiscountCode = (code) => {
  if (!code) return '';
  return code.trim().toUpperCase();
};

/**
 * Check if discount code format is valid (5 alphanumeric characters)
 * @param {string} code - Discount code to check
 * @returns {boolean} - True if format is valid
 */
export const isValidCodeFormat = (code) => {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Z0-9]{5}$/i.test(code.trim());
};
