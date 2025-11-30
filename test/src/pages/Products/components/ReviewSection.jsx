import React, { useState, useCallback } from 'react';
import { Star, Trash2, AlertTriangle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [activeTab, setActiveTab] = useState('reviews');

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        <div className="review-stats">
          <div className="stats-summary">
            <div className="average-rating">
              {stats.averageRating > 0 ? (
                <>
                  <span className="rating-number">{stats.averageRating}</span>
                  <div className="stars-display">{renderStars(Math.round(stats.averageRating), 24)}</div>
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

      {/* Tabs for Reviews and Comments */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="reviews-comments-tabs">
        <TabsList className="tabs-list">
          <TabsTrigger value="reviews" className="tab-trigger">
            <Star size={16} />
            Reviews {stats?.total > 0 && `(${stats.total})`}
          </TabsTrigger>
          <TabsTrigger value="comments" className="tab-trigger">
            <MessageCircle size={16} />
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="tab-content">
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
                            ? 'Your rating is being reviewed by our team.'
                            : 'Your rating is pending approval.'}
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
                        <div className="review-rating">{renderStars(review.rating, 20)}</div>
                      )}
                    </div>

                    <div className="review-actions">
                      {isOwnReview && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      )}
                      {!isOwnReview && user?.role === 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Remove
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
        </TabsContent>

        <TabsContent value="comments" className="tab-content">
          <CommentSection productId={productId} />
        </TabsContent>
      </Tabs>

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
