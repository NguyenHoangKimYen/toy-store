import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse, createUrl } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';

/**
 * Get reviews for a product
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters (limit, skip, sortBy, sortOrder)
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
 * Get a single review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} - Review object with populated user data
 */
export const getReviewById = async (reviewId) => {
  const url = `${API_BASE_URL}/api/reviews/${reviewId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Create a new review for a product
 * @param {string} productId - Product ID
 * @param {Object} reviewData - Review data { content, userId (optional) }
 * @returns {Promise<Object>} - Created review with populated user data
 */
export const createReview = async (productId, reviewData) => {
  const url = `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/reviews`;
  
  // Validate required fields
  if (!reviewData.content || reviewData.content.trim().length === 0) {
    throw new Error('Review content is required');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content: reviewData.content.trim(),
      userId: reviewData.userId || null,
    }),
  });
  return handleResponse(response);
};

/**
 * Update a review
 * @param {string} reviewId - Review ID
 * @param {Object} reviewData - Updated review data { content }
 * @returns {Promise<Object>} - Updated review with populated user data
 */
export const updateReview = async (reviewId, reviewData) => {
  const url = `${API_BASE_URL}/api/reviews/${reviewId}`;
  
  // Validate content if provided
  if (reviewData.content !== undefined && reviewData.content.trim().length === 0) {
    throw new Error('Review content cannot be empty');
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content: reviewData.content ? reviewData.content.trim() : undefined,
    }),
  });
  return handleResponse(response);
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export const deleteReview = async (reviewId) => {
  const url = `${API_BASE_URL}/api/reviews/${reviewId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get all reviews by a specific user
 * @param {string} userId - User ID
 * @param {Object} params - Query parameters (limit, skip)
 * @returns {Promise<Object>} - User's reviews with product data
 */
export const getUserReviews = async (userId, params = {}) => {
  const url = createUrl(`${API_BASE_URL}/api/users/${userId}/reviews`, params);
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get review count for a product
 * @param {string} productId - Product ID
 * @returns {Promise<number>} - Number of reviews
 */
export const getReviewCount = async (productId) => {
  try {
    const result = await getProductReviews(productId, { limit: 1, skip: 0 });
    return result.total || 0;
  } catch (error) {
    console.error('Error getting review count:', error);
    return 0;
  }
};

/**
 * Check if user has reviewed a product
 * @param {string} productId - Product ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if user has reviewed the product
 */
export const hasUserReviewedProduct = async (productId, userId) => {
  try {
    const result = await getProductReviews(productId);
    const reviews = result.reviews || [];
    return reviews.some(review => review.userId === userId);
  } catch (error) {
    console.error('Error checking user review:', error);
    return false;
  }
};

