import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useReviews } from '../../hooks';
import { formatDate } from '../../utils';

/**
 * ReviewList Component
 * Displays reviews for a product with pagination and CRUD operations
 */
const ReviewList = ({ productId, currentUserId }) => {
  const {
    reviews,
    loading,
    error,
    total,
    hasMore,
    loadMore,
    addReview,
    editReview,
    removeReview,
  } = useReviews(productId);

  const [newReviewContent, setNewReviewContent] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /**
   * Handle submit new review
   */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!newReviewContent.trim()) {
      alert('Please enter review content');
      return;
    }

    try {
      setSubmitting(true);
      await addReview({
        content: newReviewContent,
        userId: currentUserId || null,
      });
      setNewReviewContent('');
      alert('Review submitted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle edit review
   */
  const handleEditReview = async (reviewId) => {
    if (!editContent.trim()) {
      alert('Please enter review content');
      return;
    }

    try {
      setSubmitting(true);
      await editReview(reviewId, { content: editContent });
      setEditingReviewId(null);
      setEditContent('');
      alert('Review updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle delete review
   */
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setSubmitting(true);
      await removeReview(reviewId);
      alert('Review deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Start editing a review
   */
  const startEdit = (review) => {
    setEditingReviewId(review._id);
    setEditContent(review.content);
  };

  /**
   * Cancel editing
   */
  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditContent('');
  };

  if (loading && reviews.length === 0) {
    return <div className="review-list-loading">Loading reviews...</div>;
  }

  if (error) {
    return <div className="review-list-error">Error: {error}</div>;
  }

  return (
    <div className="review-list">
      <h2 className="review-list-title">
        Customer Reviews ({total})
      </h2>

      {/* New Review Form */}
      <div className="review-form">
        <h3>Write a Review</h3>
        <form onSubmit={handleSubmitReview}>
          <textarea
            value={newReviewContent}
            onChange={(e) => setNewReviewContent(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows="4"
            disabled={submitting}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="reviews">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="review-user">
                  {review.user ? (
                    <>
                      <strong>{review.user.fullname}</strong>
                      {currentUserId === review.userId && (
                        <span className="review-badge">You</span>
                      )}
                    </>
                  ) : (
                    <strong>Guest</strong>
                  )}
                </div>
                <div className="review-date">
                  {formatDate(review.createdAt)}
                </div>
              </div>

              <div className="review-body">
                {editingReviewId === review._id ? (
                  <div className="review-edit-form">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows="4"
                      disabled={submitting}
                    />
                    <div className="review-edit-actions">
                      <button
                        onClick={() => handleEditReview(review._id)}
                        disabled={submitting}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="review-content">{review.content}</p>
                    {currentUserId === review.userId && (
                      <div className="review-actions">
                        <button
                          onClick={() => startEdit(review)}
                          disabled={submitting}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={submitting}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="review-load-more">
          <button onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}
    </div>
  );
};

ReviewList.propTypes = {
  productId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string,
};

export default ReviewList;
