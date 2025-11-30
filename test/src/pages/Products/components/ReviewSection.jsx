import React, { useState, useCallback } from 'react';
import { Star, ThumbsUp, Flag, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useProductReviews } from '../hooks/useProductReviews';
import { useReviewPolling, useAuth } from '@/hooks';
import ReviewForm from './ReviewForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import './ReviewSection.css';

const ReviewSection = ({ productId }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { reviews, stats, loading, submitting, hasMore, eligibility, submitReview, removeReview, toggleHelpful, loadMore, refetch } = useProductReviews(productId);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);

  // Enable real-time updates via polling (30 seconds interval)
  const fetchReviews = useCallback(() => {
    refetch();
  }, [refetch]);

  useReviewPolling(fetchReviews, 30000, true);

  const handleSubmitReview = async (reviewData) => {
    if (!selectedOrderItem) {
      return false;
    }
    const success = await submitReview({
      ...reviewData,
      orderItemId: selectedOrderItem.orderItemId,
      images: reviewData.images || [], // Pass images to the hook
    });
    if (success) {
      setSelectedOrderItem(null);
    }
    return success;
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      await removeReview(reviewId);
    }
  };

  const handleToggleHelpful = async (reviewId) => {
    await toggleHelpful(reviewId);
  };

  const handleCancelReview = () => {
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
      </div>

      {/* Write Review Section - Show prominently if eligible */}
      {isAuthenticated && eligibility.canReview && (
        <Card className="write-review-card">
          <h3 className="write-review-title">Write a Review</h3>
          
          {!selectedOrderItem ? (
            <div className="select-purchase-section">
              <p className="select-purchase-label">Select the product you purchased:</p>
              <div className="purchase-options">
                {eligibility.eligibleItems.map((item) => (
                  <button
                    key={item.orderItemId}
                    onClick={() => setSelectedOrderItem(item)}
                    className="purchase-option-button"
                  >
                    <span className="purchase-variant">{item.variantName}</span>
                    <span className="purchase-date">{new Date(item.orderDate).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="selected-purchase-info">
                <p>
                  Reviewing: <strong>{selectedOrderItem.variantName}</strong>
                  <span className="text-gray-400 ml-2">
                    (Purchased {new Date(selectedOrderItem.orderDate).toLocaleDateString()})
                  </span>
                </p>
              </div>
              <ReviewForm onSubmit={handleSubmitReview} submitting={submitting} />
              <Button variant="ghost" onClick={handleCancelReview} className="mt-2">
                Cancel
              </Button>
            </>
          )}
        </Card>
      )}

      {!isAuthenticated && (
        <Card className="login-prompt-card">
          <p>Please log in to write a review</p>
        </Card>
      )}

      {isAuthenticated && !eligibility.loading && !eligibility.canReview && (
        <Card className="purchase-required-card">
          <p>Purchase this product to write a review</p>
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
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating}>
                  {renderRatingBar(rating, stats.distribution[rating] || 0, stats.total)}
                </div>
              ))}
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
              // Handle backend's populated userId object - use fullName field
              const userName = review.userId?.fullName || review.userId?.username || review.userName || 'Anonymous';
              const userAvatar = review.userId?.avatar || review.userAvatar;
              const isOwnReview = user && (review.userId?._id === user._id || review.userId === user._id);
              const isPending = review.status === 'pending' || review.status === 'flagged';
              
              return (
              <Card key={review._id} className={`review-card ${isPending ? 'review-pending' : ''}`}>
                {/* Pending/Flagged notice for own reviews */}
                {isOwnReview && isPending && (
                  <div className="review-pending-notice">
                    <AlertTriangle size={16} />
                    <span>
                      {review.status === 'flagged' 
                        ? 'Your review may contain inappropriate content and is being reviewed by our team.'
                        : 'Your review is pending approval and will be visible to others once approved.'}
                    </span>
                  </div>
                )}
                
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
                      <p className="reviewer-name">
                        {userName}
                        {isOwnReview && <span className="own-review-badge">You</span>}
                      </p>
                      <p className="review-date">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  {review.rating && (
                    <div className="review-rating">{renderStars(review.rating)}</div>
                  )}
                </div>
                
                {/* Variant Info */}
                {(review.variantId?.attributes?.length > 0 || review.variantName) && (
                  <div className="review-variant-info">
                    <span>Purchased: <strong>
                      {review.variantId?.attributes?.length > 0 
                        ? review.variantId.attributes.map(attr => attr.value).join(', ')
                        : review.variantName}
                    </strong></span>
                  </div>
                )}

                <p className="review-content">{review.comment || review.content}</p>
                
                {/* Review Images */}
                {review.imageUrls && review.imageUrls.length > 0 && (
                  <div className="review-images">
                    {review.imageUrls.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Review image ${idx + 1}`} 
                        className="review-image"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                )}

                <div className="review-actions">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleToggleHelpful(review._id)}
                    className={review.isHelpful ? 'helpful-active' : ''}
                  >
                    <ThumbsUp size={16} fill={review.isHelpful ? 'currentColor' : 'none'} />
                    Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                  </Button>
                  {isOwnReview ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm">
                      <Flag size={16} />
                      Report
                    </Button>
                  )}
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
