import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse, createUrl } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';
import { mockReviews } from '@/mocks';

// Mock data flag
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Get reviews for a product
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters (limit, skip, sort)
 * @returns {Promise<Object>} - Reviews data with pagination
 */
export const getProductReviews = async (productId, params = {}) => {
  if (USE_MOCK_DATA) {
    // Get mock reviews for this product
    const productReviews = mockReviews.filter(r => r.productId === productId);
    
    // Get reviews from localStorage
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const productLocalReviews = localReviews.filter(r => r.productId === productId);
    
    // Merge and sort by date
    let allReviews = [...productReviews, ...productLocalReviews].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Apply pagination
    const skip = params.skip || 0;
    const limit = params.limit || 10;
    const paginatedReviews = allReviews.slice(skip, skip + limit);
    
    return {
      reviews: paginatedReviews,
      total: allReviews.length,
      hasMore: skip + limit < allReviews.length,
    };
  }

  try {
    const url = createUrl(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/reviews`, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

/**
 * Create a new review for a product
 * @param {string} productId - Product ID
 * @param {Object} reviewData - Review data (rating, content, userId, userName)
 * @returns {Promise<Object>} - Created review
 */
export const createReview = async (productId, reviewData) => {
  if (USE_MOCK_DATA) {
    // Create new review object
    const newReview = {
      _id: `review-${Date.now()}`,
      productId,
      userId: reviewData.userId || null,
      userName: reviewData.userName || 'Anonymous',
      userAvatar: reviewData.userAvatar || null,
      rating: reviewData.rating,
      content: reviewData.content,
      createdAt: new Date().toISOString(),
      helpful: 0,
      verified: !!reviewData.userId,
    };
    
    // Save to localStorage
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    localReviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(localReviews));
    
    return newReview;
  }

  try {
    const url = `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/reviews`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

/**
 * Update a review
 * @param {string} reviewId - Review ID
 * @param {Object} reviewData - Updated review data
 * @returns {Promise<Object>} - Updated review
 */
export const updateReview = async (reviewId, reviewData) => {
  if (USE_MOCK_DATA) {
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const reviewIndex = localReviews.findIndex(r => r._id === reviewId);
    
    if (reviewIndex === -1) {
      throw new Error('Review not found');
    }
    
    localReviews[reviewIndex] = {
      ...localReviews[reviewIndex],
      ...reviewData,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('reviews', JSON.stringify(localReviews));
    return localReviews[reviewIndex];
  }

  try {
    const url = `${API_BASE_URL}${ENDPOINTS.REVIEWS}/${reviewId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export const deleteReview = async (reviewId) => {
  if (USE_MOCK_DATA) {
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const filteredReviews = localReviews.filter(r => r._id !== reviewId);
    localStorage.setItem('reviews', JSON.stringify(filteredReviews));
    return { success: true };
  }

  try {
    const url = `${API_BASE_URL}${ENDPOINTS.REVIEWS}/${reviewId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/**
 * Get review statistics for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Review statistics
 */
export const getReviewStats = async (productId) => {
  if (USE_MOCK_DATA) {
    // Get all reviews for this product
    const productReviews = mockReviews.filter(r => r.productId === productId);
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const productLocalReviews = localReviews.filter(r => r.productId === productId);
    const allReviews = [...productReviews, ...productLocalReviews];
    
    if (allReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    
    // Calculate stats
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;
    
    allReviews.forEach(review => {
      distribution[review.rating]++;
      totalRating += review.rating;
    });
    
    return {
      averageRating: totalRating / allReviews.length,
      totalReviews: allReviews.length,
      distribution,
    };
  }

  try {
    const url = `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/reviews/stats`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching review stats:', error);
    throw error;
  }
};
