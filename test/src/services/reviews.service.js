import apiClient from './config';

/**
 * Reviews Service
 * 
 * Backend endpoints:
 * - GET /reviews/product/:productId - Get reviews for a product
 * - GET /reviews/pending - Get products pending review (auth required)
 * - POST /reviews - Create review with FormData (auth required, supports images)
 * - PATCH /reviews/:reviewId - Update review with FormData (auth required)
 * - DELETE /reviews/:reviewId - Delete review (auth required)
 * - PATCH /reviews/:reviewId/moderate - Admin moderate review
 */

/**
 * Get reviews for a product
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters (page, limit, sort, rating)
 * @returns {Promise<Object>} - Reviews data with pagination
 */
export const getProductReviews = async (productId, params = {}) => {
  const response = await apiClient.get(`/reviews/product/${productId}`, { params });
  return response;
};

/**
 * Get products pending review for current user
 * Returns products from delivered orders that haven't been reviewed yet
 * @returns {Promise<Array>} - List of products to review
 */
export const getPendingReviews = async () => {
  const response = await apiClient.get('/reviews/pending');
  return response.data || response;
};

/**
 * Create a new review for a product
 * Supports image uploads via FormData
 * @param {Object} reviewData - Review data { productId, variantId, rating, comment, images? }
 * @returns {Promise<Object>} - Created review with populated user data
 */
export const createReview = async (reviewData) => {
  // Validate required fields
  if (!reviewData.productId) {
    throw new Error('Product ID is required');
  }
  if (!reviewData.variantId) {
    throw new Error('Variant ID is required');
  }
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Use FormData if images are included
  if (reviewData.images && reviewData.images.length > 0) {
    const formData = new FormData();
    formData.append('productId', reviewData.productId);
    formData.append('variantId', reviewData.variantId);
    formData.append('rating', reviewData.rating);
    formData.append('comment', reviewData.comment?.trim() || '');
    
    // Append images (backend expects 'images' field from multer)
    reviewData.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await apiClient.post('/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  }

  // No images - use JSON
  const response = await apiClient.post('/reviews', {
    productId: reviewData.productId,
    variantId: reviewData.variantId,
    rating: reviewData.rating,
    comment: reviewData.comment?.trim() || '',
  });
  return response;
};

/**
 * Update a review
 * Supports image uploads and deletions
 * @param {string} reviewId - Review ID
 * @param {Object} reviewData - Updated review data { rating, comment, images?, deletedImages? }
 * @returns {Promise<Object>} - Updated review with populated user data
 */
export const updateReview = async (reviewId, reviewData) => {
  if (reviewData.rating && (reviewData.rating < 1 || reviewData.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Use FormData if new images are included or images are being deleted
  if ((reviewData.images && reviewData.images.length > 0) || reviewData.deletedImages) {
    const formData = new FormData();
    
    if (reviewData.rating) {
      formData.append('rating', reviewData.rating);
    }
    if (reviewData.comment !== undefined) {
      formData.append('comment', reviewData.comment?.trim() || '');
    }
    
    // Images to delete
    if (reviewData.deletedImages) {
      const deletedArr = Array.isArray(reviewData.deletedImages) 
        ? reviewData.deletedImages 
        : [reviewData.deletedImages];
      deletedArr.forEach(url => {
        formData.append('deletedImages', url);
      });
    }
    
    // New images to upload
    if (reviewData.images) {
      reviewData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.patch(`/reviews/${reviewId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  }

  // No image changes - use JSON
  const response = await apiClient.patch(`/reviews/${reviewId}`, {
    rating: reviewData.rating,
    comment: reviewData.comment?.trim(),
  });
  return response;
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export const deleteReview = async (reviewId) => {
  const response = await apiClient.delete(`/reviews/${reviewId}`);
  return response;
};

/**
 * Get review count for a product
 * @param {string} productId - Product ID
 * @returns {Promise<number>} - Number of reviews
 */
export const getReviewCount = async (productId) => {
  try {
    const result = await getProductReviews(productId, { limit: 1, page: 1 });
    return result.metadata?.total || 0;
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
    const reviews = result.metadata?.reviews || [];
    return reviews.some(review => review.userId?._id === userId || review.userId === userId);
  } catch (error) {
    console.error('Error checking user review:', error);
    return false;
  }
};

/**
 * Get review statistics for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Review statistics (total, averageRating, distribution)
 */
export const getReviewStats = async (productId) => {
  try {
    const result = await getProductReviews(productId, { limit: 1000, page: 1 });
    const reviews = result.metadata?.reviews || [];
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    
    reviews.forEach(review => {
      if (review.rating && review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
        totalRating += review.rating;
      }
    });
    
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
    
    return {
      total: result.metadata?.total || reviews.length,
      count: reviews.length,
      averageRating: parseFloat(averageRating),
      distribution,
    };
  } catch (error) {
    console.error('Error getting review stats:', error);
    return {
      total: 0,
      count: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
};
