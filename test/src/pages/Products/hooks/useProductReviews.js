import { useState, useEffect } from 'react';
import { getProductReviews, createReview, getReviewStats } from '@/services/reviews.service';
import { toast } from 'sonner';

export const useProductReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const loadReviews = async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = resetPage ? 0 : page;
      const skip = currentPage * pageSize;
      
      const data = await getProductReviews(productId, {
        limit: pageSize,
        skip,
      });
      
      if (resetPage) {
        setReviews(data.reviews);
        setPage(0);
      } else {
        setReviews(prev => [...prev, ...data.reviews]);
      }
      
      setHasMore(data.hasMore);
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

  useEffect(() => {
    if (productId) {
      loadReviews(true);
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const submitReview = async (reviewData) => {
    try {
      setSubmitting(true);
      const newReview = await createReview(productId, reviewData);
      
      // Add new review to the top of the list
      setReviews(prev => [newReview, ...prev]);
      
      // Reload stats
      await loadStats();
      
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

  useEffect(() => {
    if (page > 0) {
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
    submitReview,
    loadMore,
    refetch: () => loadReviews(true),
  };
};
