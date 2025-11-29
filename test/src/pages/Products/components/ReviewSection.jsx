import React, { useState, useCallback } from 'react';
import { Star, ThumbsUp, Flag, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useProductReviews } from '../hooks/useProductReviews';
import { useReviewPolling, useAuth } from '@/hooks';
import ReviewForm from './ReviewForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import './ReviewSection.css';

const ReviewSection = ({ productId }) => {
  const { isAuthenticated } = useAuth();
  const { reviews, stats, loading, submitting, hasMore, eligibility, submitReview, loadMore, refetch } = useProductReviews(productId);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);

  // Enable real-time updates via polling (30 seconds interval)
  const fetchReviews = useCallback(() => {
    if (!showForm) {  // Only poll when not writing a review
      refetch();
    }
  }, [refetch, showForm]);

  useReviewPolling(fetchReviews, 30000, true);

  const handleSubmitReview = async (reviewData) => {
    if (!selectedOrderItem) {
      return false;
    }
    const success = await submitReview({
      ...reviewData,
      orderItemId: selectedOrderItem.orderItemId,
    });
    if (success) {
      setShowForm(false);
      setSelectedOrderItem(null);
    }
    return success;
  };

  const handleStartReview = (orderItem) => {
    setSelectedOrderItem(orderItem);
    setShowForm(true);
  };

  const handleCancelReview = () => {
    setShowForm(false);
    setSelectedOrderItem(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'star-filled' : 'star-empty'}
        fill={index < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  const renderRatingBar = (rating, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="rating-bar">
        <span className="rating-label">{rating} ★</span>
        <div className="bar-container">
          <div className="bar-fill" style={{ width: `${percentage}%` }} />
        </div>
        <span className="rating-count">{count}</span>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="review-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="review-section" id="reviews">
      <div className="review-header">
        <div className="review-header-left">
          <h2>Customer Reviews</h2>
        </div>
        
        {/* Review eligibility UI */}
        {!showForm && (
          <>
            {!isAuthenticated ? (
              <p className="review-login-prompt">Please log in to write a review</p>
            ) : eligibility.loading ? (
              <span className="text-sm text-gray-500">Checking eligibility...</span>
            ) : eligibility.canReview ? (
              <div className="eligible-orders">
                <p className="text-sm text-gray-600 mb-2">Select a purchase to review:</p>
                <div className="flex flex-wrap gap-2">
                  {eligibility.eligibleItems.map((item) => (
                    <Button
                      key={item.orderItemId}
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartReview(item)}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag size={14} />
                      {item.variantName} - {new Date(item.orderDate).toLocaleDateString()}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <ShoppingBag size={16} />
                You must purchase this product to write a review
              </p>
            )}
          </>
        )}
      </div>

      {showForm && selectedOrderItem && (
        <Card className="review-form-card">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Reviewing purchase: <strong>{selectedOrderItem.variantName}</strong>
              <span className="text-gray-400 ml-2">
                (Order from {new Date(selectedOrderItem.orderDate).toLocaleDateString()})
              </span>
            </p>
          </div>
          <ReviewForm onSubmit={handleSubmitReview} submitting={submitting} />
          <Button variant="ghost" onClick={handleCancelReview} className="mt-2">
            Cancel
          </Button>
        </Card>
      )}

      {stats && (
        <div className="review-stats">
          <div className="stats-summary">
            <div className="average-rating">
              {stats.averageRating > 0 ? (
                <>
                  <span className="rating-number">{stats.averageRating}</span>
                  <div className="stars-display">{renderStars(Math.round(stats.averageRating))}</div>
                </>
              ) : (
                <span className="rating-number">No ratings yet</span>
              )}
              <span className="total-reviews">{stats.total} reviews</span>
            </div>
          </div>

          {stats.averageRating > 0 && (
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => 
                renderRatingBar(rating, stats.distribution[rating] || 0, stats.total)
              )}
            </div>
          )}
        </div>
      )}

      <Separator className="my-6" />

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <>
            {reviews.map((review) => {
              // Handle backend's populated userId object
              const userName = review.userName || review.userId?.name || review.userId?.fullName || 'Anonymous';
              const userAvatar = review.userAvatar || review.userId?.avatar;
              
              return (
              <Card key={review._id} className="review-card">
                <div className="review-header-info">
                  <div className="reviewer-info">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} className="reviewer-avatar" />
                    ) : (
                      <div className="reviewer-avatar-placeholder">
                        {userName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                    <div>
                      <p className="reviewer-name">{userName}</p>
                      <p className="review-date">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  {review.rating && (
                    <div className="review-rating">{renderStars(review.rating)}</div>
                  )}
                </div>

                <p className="review-content">{review.comment || review.content}</p>

                <div className="review-actions">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp size={16} />
                    Helpful
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag size={16} />
                    Report
                  </Button>
                </div>
              </Card>
              );
            })}

            {hasMore && (
              <div className="load-more">
                <Button onClick={loadMore} variant="outline" disabled={loading}>
                  {loading ? 'Loading...' : 'Load More Reviews'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
