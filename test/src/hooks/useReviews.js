import { useState, useEffect, useCallback } from 'react';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  hasUserReviewedProduct,
} from '../services/reviews.service';

/**
 * Custom hook for managing product reviews
 * @param {string} productId - Product ID
 * @param {Object} options - Hook options { limit, page, sort, rating, autoLoad }
 * @returns {Object} - Reviews state and actions
 */
export const useReviews = (productId, options = {}) => {
  const {
    limit = 10,
    page: initialPage = 1,
    sort = 'desc',
    rating = null,
    autoLoad = true,
  } = options;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);

  /**
   * Load reviews for the product
   */
  const loadReviews = useCallback(async (resetPage = false) => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const pageValue = resetPage ? 1 : currentPage;

      const result = await getProductReviews(productId, {
        limit,
        page: pageValue,
        sort,
        rating,
      });

      const reviewsData = result.metadata?.reviews || [];
      
      setReviews(reviewsData);
      setTotal(result.metadata?.total || 0);
      
      if (resetPage) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, limit, currentPage, sort, rating]);

  /**
   * Load next page of reviews
   */
  const loadMore = useCallback(() => {
    if (loading) return;
    setCurrentPage(prev => prev + 1);
  }, [loading]);

  /**
   * Refresh reviews (reload from beginning)
   */
  const refresh = useCallback(() => {
    loadReviews(true);
  }, [loadReviews]);

  /**
   * Add a new review
   * @param {Object} reviewData - { productId, variantId, rating, comment }
   */
  const addReview = useCallback(async (reviewData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await createReview(reviewData);
      
      if (result.message || result.metadata) {
        // Refresh reviews after adding
        await loadReviews(true);
        return result.metadata;
      } else {
        throw new Error('Failed to create review');
      }
    } catch (err) {
      setError(err.message || 'Failed to add review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReviews]);

  /**
   * Update an existing review
   */
  const editReview = useCallback(async (reviewId, reviewData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateReview(reviewId, reviewData);
      
      if (result.message || result.metadata) {
        // Update the review in state
        setReviews(prev =>
          prev.map(review =>
            review._id === reviewId ? result.metadata : review
          )
        );
        return result.metadata;
      } else {
        throw new Error('Failed to update review');
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
      
      if (result.message) {
        // Remove review from state
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        setTotal(prev => prev - 1);
        return true;
      } else {
        throw new Error('Failed to delete review');
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
  }, [autoLoad, productId, sort, rating]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more when page changes
  useEffect(() => {
    if (currentPage > 1) {
      loadReviews(false);
    }
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    reviews,
    loading,
    error,
    total,
    currentPage,
    hasMore: reviews.length < total,
    loadReviews,
    loadMore,
    refresh,
    addReview,
    editReview,
    removeReview,
    checkUserReview,
  };
};

export default useReviews;
