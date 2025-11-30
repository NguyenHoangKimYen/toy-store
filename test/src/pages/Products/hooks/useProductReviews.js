import { useState, useEffect } from 'react';
import { getProductReviews, createReview, getReviewStats, checkReviewEligibility, deleteReview, toggleReviewHelpful } from '@/services/reviews.service';
import { toast } from 'sonner';
import { useAuth } from '@/hooks';

export const useProductReviews = (productId) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Review eligibility state - simplified, just check if user can review
  const [eligibility, setEligibility] = useState({
    canReview: false,
    hasReviewed: false,
    loading: true,
  });

  const loadReviews = async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = resetPage ? 1 : page + 1;
      
      const data = await getProductReviews(productId, {
        limit: pageSize,
        page: currentPage,
      });
      
      const reviewsData = data.metadata?.reviews || [];
      
      if (resetPage) {
        setReviews(reviewsData);
        setPage(1);
      } else {
        setReviews(prev => [...prev, ...reviewsData]);
        setPage(currentPage);
      }
      
      const total = data.metadata?.total || 0;
      setHasMore((currentPage * pageSize) < total);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.message || 'Failed to load reviews');
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getReviewStats(productId);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading review stats:', err);
    }
  };

  const loadEligibility = async () => {
    if (!isAuthenticated || !productId) {
      setEligibility({ canReview: false, hasReviewed: false, loading: false });
      return;
    }
    
    try {
      const result = await checkReviewEligibility(productId);
      setEligibility({
        canReview: result.canReview,
        hasReviewed: result.hasReviewed || false,
        loading: false,
      });
    } catch (err) {
      console.error('Error checking review eligibility:', err);
      setEligibility({ canReview: false, hasReviewed: false, loading: false });
    }
  };

  useEffect(() => {
    if (productId) {
      loadReviews(true);
      loadStats();
      loadEligibility();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isAuthenticated]);

  const submitReview = async (reviewData) => {
    try {
      setSubmitting(true);
      
      // Simplified - only rating, no text or images for reviews
      const backendData = {
        productId,
        rating: reviewData.rating,
      };
      
      const result = await createReview(backendData);
      
      const newReview = result.metadata;
      
      // Add new review to the top of the list
      setReviews(prev => [newReview, ...prev]);
      
      // Reload stats and eligibility
      await loadStats();
      await loadEligibility();
      
      toast.success('Review submitted successfully!');
      return true;
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(err.message || 'Failed to submit review');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const removeReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      
      // Remove review from the list
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      
      // Reload stats and eligibility
      await loadStats();
      await loadEligibility();
      
      toast.success('Review deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error(err.message || 'Failed to delete review');
      return false;
    }
  };

  const toggleHelpful = async (reviewId) => {
    try {
      const response = await toggleReviewHelpful(reviewId);
      const { helpfulCount, isHelpful } = response;
      
      // Update the review in the list
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, helpfulCount, isHelpful }
          : review
      ));
      
      return true;
    } catch (err) {
      console.error('Error toggling helpful:', err);
      if (err.response?.status === 401) {
        toast.error('Please log in to mark reviews as helpful');
      } else {
        toast.error('Failed to update helpful status');
      }
      return false;
    }
  };

  useEffect(() => {
    if (page > 1) {
      loadReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return {
    reviews,
    stats,
    loading,
    submitting,
    error,
    hasMore,
    eligibility,
    submitReview,
    removeReview,
    toggleHelpful,
    loadMore,
    refetch: () => {
      loadReviews(true);
      loadStats();
      loadEligibility();
    },
    // Expose setters for real-time WebSocket updates
    setReviews,
    setStats,
  };
};
