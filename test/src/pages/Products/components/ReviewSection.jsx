import React, { useState, useCallback } from 'react';
import { Star, Trash2, AlertTriangle, ChevronDown, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProductReviews } from '../hooks/useProductReviews';
import { useProductSocket, useAuth } from '@/hooks';
import ReviewForm from './ReviewForm';
import CommentSection from './CommentSection';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LoginPromptDialog from '@/components/common/LoginPromptDialog';
import './ReviewSection.css';

const ReviewSection = ({ productId }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { reviews, stats, loading, submitting, hasMore, eligibility, submitReview, removeReview, loadMore, refetch, setReviews } = useProductReviews(productId);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState('');
  const [showRatingsPopup, setShowRatingsPopup] = useState(false);

  // Real-time update handlers for WebSocket
  const handleNewReview = useCallback((review) => {
    // Add new review to the top if not already present
    setReviews(prev => {
      if (prev.some(r => r._id === review._id)) return prev;
      return [review, ...prev];
    });
    // Refresh stats when new review arrives
    refetch();
  }, [setReviews, refetch]);

  const handleReviewDeleted = useCallback((reviewId) => {
    setReviews(prev => prev.filter(r => r._id !== reviewId));
    refetch(); // Refresh stats
  }, [setReviews, refetch]);

  // Use WebSocket for real-time updates instead of polling
  useProductSocket(productId, {
    onNewReview: handleNewReview,
    onReviewDeleted: handleReviewDeleted,
  });

  const handleSubmitReview = async (reviewData) => {
    const success = await submitReview({
      rating: reviewData.rating,
    });
    if (success) {
      setShowReviewForm(false);
    }
    return success;
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this rating? This action cannot be undone.')) {
      await removeReview(reviewId);
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
  };

  const renderStars = (rating, size = 16) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={size}
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

      {/* Write Review Section - Show for authenticated users who haven't reviewed yet */}
      {isAuthenticated && eligibility.canReview && (
        <Card className="write-review-card">
          <h3 className="write-review-title">Write a Review</h3>
          
          {!showReviewForm ? (
            <div className="start-review-section">
              <p>Share your thoughts about this product</p>
              <Button onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            </div>
          ) : (
            <>
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
          <Button variant="outline" onClick={() => {
            setLoginPromptAction('write a review');
            setShowLoginPrompt(true);
          }}>
            Log In
          </Button>
        </Card>
      )}

      {isAuthenticated && !eligibility.loading && eligibility.hasReviewed && (
        <Card className="already-reviewed-card">
          <p>You have already reviewed this product</p>
        </Card>
      )}

      {stats && (
        <div className="review-stats-compact">
          <div className="stats-summary-compact">
            {stats.averageRating > 0 ? (
              <>
                <span className="rating-number-compact">{stats.averageRating}</span>
                <div className="stars-display-compact">{renderStars(Math.round(stats.averageRating), 20)}</div>
                <span className="total-reviews-compact">({stats.total} ratings)</span>
              </>
            ) : (
              <span className="no-ratings-text">No ratings yet</span>
            )}
            
            {/* Show Ratings Button */}
            {stats.total > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="view-ratings-btn"
                onClick={() => setShowRatingsPopup(!showRatingsPopup)}
              >
                <ChevronDown size={16} className={showRatingsPopup ? 'rotate-180' : ''} />
                View Ratings
              </Button>
            )}
          </div>

          {/* Ratings Popup/Dropdown */}
          {showRatingsPopup && stats.total > 0 && (
            <Card className="ratings-popup">
              <div className="ratings-popup-header">
                <h4>Rating Distribution</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowRatingsPopup(false)}>
                  <X size={16} />
                </Button>
              </div>
              
              <div className="rating-distribution-popup">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating}>
                    {renderRatingBar(rating, stats.distribution[rating] || 0, stats.total)}
                  </div>
                ))}
              </div>

              {/* Rating History List */}
              <div className="ratings-list">
                <h5>Recent Ratings</h5>
                {reviews.length === 0 ? (
                  <p className="no-ratings-list">No ratings to display</p>
                ) : (
                  <>
                    {reviews.slice(0, 5).map((review) => {
                      const userName = review.userId?.fullName || review.userId?.username || 'Anonymous';
                      const userAvatar = review.userId?.avatar;
                      const isOwnReview = user && (review.userId?._id === user._id || review.userId === user._id);
                      
                      return (
                        <div key={review._id} className="rating-item">
                          <div className="rating-item-user">
                            {userAvatar ? (
                              <img src={userAvatar} alt={userName} className="rating-item-avatar" />
                            ) : (
                              <div className="rating-item-avatar-placeholder">
                                <User size={12} />
                              </div>
                            )}
                            <span className="rating-item-name">
                              {userName}
                              {isOwnReview && <span className="own-badge">(You)</span>}
                            </span>
                          </div>
                          <div className="rating-item-stars">{renderStars(review.rating, 14)}</div>
                          {isOwnReview && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="rating-item-delete"
                              onClick={() => handleDeleteReview(review._id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                    {reviews.length > 5 && (
                      <p className="more-ratings">+{reviews.length - 5} more ratings</p>
                    )}
                    {hasMore && (
                      <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
                        Load More
                      </Button>
                    )}
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Comments Section - Now the main content */}
      <CommentSection productId={productId} />

      {/* Login Prompt Dialog */}
      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        action={loginPromptAction}
        returnPath={`/products/${productId}`}
      />
    </div>
  );
};

export default ReviewSection;
