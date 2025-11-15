import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse, createUrl } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';

/**
 * Get reviews for a product
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters (limit, skip, sort)
 * @returns {Promise<Object>} - Reviews data with pagination
 */
export const getProductReviews = async (productId, params = {}) => {
  const url = createUrl(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/reviews`, params);
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Create a new review for a product
 * @param {string} productId - Product ID
 * @param {Object} reviewData - Review data (rating, content, userId, userName)
 * @returns {Promise<Object>} - Created review
 */
export const createReview = async (productId, reviewData) => {
  const url = `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/reviews`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData),
  });
  return handleResponse(response);
};

/**
 * Update a review
 * @param {string} reviewId - Review ID
 * @param {Object} reviewData - Updated review data
 * @returns {Promise<Object>} - Updated review
 */
export const updateReview = async (reviewId, reviewData) => {
  const url = `${API_BASE_URL}${ENDPOINTS.REVIEWS}/${reviewId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData),
  });
  return handleResponse(response);
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export const deleteReview = async (reviewId) => {
  const url = `${API_BASE_URL}${ENDPOINTS.REVIEWS}/${reviewId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get review statistics for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Review statistics
 */
export const getReviewStats = async (productId) => {
  const url = `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/reviews/stats`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
