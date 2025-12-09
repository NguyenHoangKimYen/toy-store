import apiClient from './config';

/**
 * Get comments for a product
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} - Comments data with pagination
 */
export const getProductComments = async (productId, params = {}) => {
  const response = await apiClient.get(`/comments/product/${productId}`, { params });
  return response;
};

/**
 * Create a new comment
 * No login required - guests can comment
 * Supports image uploads (up to 3 images)
 * @param {Object} commentData - { productId, content, guestName?, guestEmail?, parentId?, images? }
 * @returns {Promise<Object>} - Created comment
 */
export const createComment = async (commentData) => {
  if (!commentData.productId) {
    throw new Error('Product ID is required');
  }
  if (!commentData.content?.trim()) {
    throw new Error('Comment content is required');
  }

  // Use FormData if there are images
  if (commentData.images && commentData.images.length > 0) {
    const formData = new FormData();
    formData.append('productId', commentData.productId);
    formData.append('content', commentData.content.trim());
    
    if (commentData.guestName) {
      formData.append('guestName', commentData.guestName.trim());
    }
    if (commentData.guestEmail) {
      formData.append('guestEmail', commentData.guestEmail.trim());
    }
    if (commentData.parentId) {
      formData.append('parentId', commentData.parentId);
    }

    // Append images
    commentData.images.forEach((file) => {
      formData.append('commentImages', file);
    });

    // Don't set Content-Type header - axios will set it automatically with the correct boundary
    const response = await apiClient.post('/comments', formData);
    return response;
  }

  // Regular JSON request without images
  const response = await apiClient.post('/comments', {
    productId: commentData.productId,
    content: commentData.content.trim(),
    guestName: commentData.guestName?.trim() || 'Anonymous',
    guestEmail: commentData.guestEmail?.trim() || null,
    parentId: commentData.parentId || null,
  });
  return response;
};

/**
 * Get replies for a comment
 * @param {string} commentId - Comment ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} - Replies data
 */
export const getCommentReplies = async (commentId, params = {}) => {
  const response = await apiClient.get(`/comments/${commentId}/replies`, { params });
  return response;
};

/**
 * Toggle like on a comment (requires login)
 * @param {string} commentId - Comment ID
 * @returns {Promise<Object>} - { likesCount, isLiked }
 */
export const toggleCommentLike = async (commentId) => {
  const response = await apiClient.post(`/comments/${commentId}/like`);
  return response;
};

/**
 * Delete a comment (requires login, own comment or admin)
 * @param {string} commentId - Comment ID
 * @returns {Promise<Object>}
 */
export const deleteComment = async (commentId) => {
  const response = await apiClient.delete(`/comments/${commentId}`);
  return response;
};
