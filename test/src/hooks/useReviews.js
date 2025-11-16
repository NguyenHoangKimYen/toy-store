import { useState, useEffect, useCallback } from 'react';
import {
  getProductReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  hasUserReviewedProduct,
} from '../services/reviews.service';

/**
 * Custom hook for managing product reviews
 * @param {string} productId - Product ID
 * @param {Object} options - Hook options { limit, skip, sortBy, sortOrder, autoLoad }
 * @returns {Object} - Reviews state and actions
 */
export const useReviews = (productId, options = {}) => {
  const {
    limit = 10,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    autoLoad = true,
  } = options;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentSkip, setCurrentSkip] = useState(skip);

  /**
   * Load reviews for the product
   */
  const loadReviews = useCallback(async (resetSkip = false) => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const skipValue = resetSkip ? 0 : currentSkip;

      const result = await getProductReviews(productId, {
        limit,
        skip: skipValue,
        sortBy,
        sortOrder,
      });

      if (resetSkip) {
        setReviews(result.reviews || []);
        setCurrentSkip(0);
      } else {
        setReviews(prev => skipValue === 0 ? result.reviews : [...prev, ...(result.reviews || [])]);
      }

      setTotal(result.total || 0);
      setHasMore(result.hasMore || false);
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, limit, currentSkip, sortBy, sortOrder]);

  /**
   * Load more reviews (pagination)
   */
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    setCurrentSkip(prev => prev + limit);
  }, [hasMore, loading, limit]);

  /**
   * Refresh reviews (reload from beginning)
   */
  const refresh = useCallback(() => {
    loadReviews(true);
  }, [loadReviews]);

  /**
   * Add a new review
   */
  const addReview = useCallback(async (reviewData) => {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      setLoading(true);
      setError(null);

      const result = await createReview(productId, reviewData);
      
      if (result.success) {
        // Refresh reviews after adding
        await loadReviews(true);
        return result.review;
      } else {
        throw new Error(result.message || 'Failed to create review');
      }
    } catch (err) {
      setError(err.message || 'Failed to add review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId, loadReviews]);

  /**
   * Update an existing review
   */
  const editReview = useCallback(async (reviewId, reviewData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateReview(reviewId, reviewData);
      
      if (result.success) {
        // Update the review in state
        setReviews(prev =>
          prev.map(review =>
            review._id === reviewId ? result.review : review
          )
        );
        return result.review;
      } else {
        throw new Error(result.message || 'Failed to update review');
      }
    } catch (err) {
      setError(err.message || 'Failed to update review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a review
   */
  const removeReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await deleteReview(reviewId);
      
      if (result.success) {
        // Remove review from state
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        setTotal(prev => prev - 1);
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete review');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if current user has reviewed the product
   */
  const checkUserReview = useCallback(async (userId) => {
    if (!userId || !productId) return false;

    try {
      return await hasUserReviewedProduct(productId, userId);
    } catch (err) {
      console.error('Error checking user review:', err);
      return false;
    }
  }, [productId]);

  // Auto-load reviews on mount or when dependencies change
  useEffect(() => {
    if (autoLoad && productId) {
      loadReviews(true);
    }
  }, [autoLoad, productId, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more when skip changes
  useEffect(() => {
    if (currentSkip > 0) {
      loadReviews(false);
    }
  }, [currentSkip]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    reviews,
    loading,
    error,
    total,
    hasMore,
    loadReviews,
    loadMore,
    refresh,
    addReview,
    editReview,
    removeReview,
    checkUserReview,
  };
};

/**
 * Custom hook for managing a single review
 * @param {string} reviewId - Review ID
 * @returns {Object} - Review state and actions
 */
export const useReview = (reviewId) => {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReview = useCallback(async () => {
    if (!reviewId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getReviewById(reviewId);
      setReview(result);
    } catch (err) {
      setError(err.message || 'Failed to load review');
      console.error('Error loading review:', err);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  return {
    review,
    loading,
    error,
    refresh: loadReview,
  };
};

/**
 * Custom hook for managing user's reviews
 * @param {string} userId - User ID
 * @param {Object} options - Hook options { limit, skip, autoLoad }
 * @returns {Object} - User reviews state and actions
 */
export const useUserReviews = (userId, options = {}) => {
  const { limit = 10, skip = 0, autoLoad = true } = options;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentSkip, setCurrentSkip] = useState(skip);

  const loadUserReviews = useCallback(async (resetSkip = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const skipValue = resetSkip ? 0 : currentSkip;

      const result = await getUserReviews(userId, {
        limit,
        skip: skipValue,
      });

      if (resetSkip) {
        setReviews(result.reviews || []);
        setCurrentSkip(0);
      } else {
        setReviews(prev => skipValue === 0 ? result.reviews : [...prev, ...(result.reviews || [])]);
      }

      setTotal(result.total || 0);
      setHasMore(result.hasMore || false);
    } catch (err) {
      setError(err.message || 'Failed to load user reviews');
      console.error('Error loading user reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, limit, currentSkip]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    setCurrentSkip(prev => prev + limit);
  }, [hasMore, loading, limit]);

  const refresh = useCallback(() => {
    loadUserReviews(true);
  }, [loadUserReviews]);

  useEffect(() => {
    if (autoLoad && userId) {
      loadUserReviews(true);
    }
  }, [autoLoad, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentSkip > 0) {
      loadUserReviews(false);
    }
  }, [currentSkip]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    reviews,
    loading,
    error,
    total,
    hasMore,
    loadMore,
    refresh,
  };
};

export default useReviews;
