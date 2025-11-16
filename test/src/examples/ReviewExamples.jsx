/**
 * Review System Usage Examples
 * 
 * This file demonstrates how to use the review system in your application
 */

import React from 'react';
import { useReviews, useUserReviews } from '../hooks';
import ReviewList from '../components/common/ReviewList';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../services';

// ============================================================================
// Example 1: Simple Review List Component
// ============================================================================

function SimpleProductReviews({ productId }) {
  const { reviews, loading, total } = useReviews(productId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Reviews ({total})</h2>
      {reviews.map(review => (
        <div key={review._id}>
          <strong>{review.user?.fullname || 'Guest'}</strong>
          <p>{review.content}</p>
          <small>{new Date(review.createdAt).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 2: Reviews with Load More
// ============================================================================

function ReviewsWithPagination({ productId }) {
  const {
    reviews,
    loading,
    hasMore,
    loadMore,
  } = useReviews(productId, { limit: 5 });

  return (
    <div>
      {reviews.map(review => (
        <div key={review._id} className="review">
          <p>{review.content}</p>
        </div>
      ))}
      
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Example 3: Create Review Form
// ============================================================================

function CreateReviewForm({ productId, userId }) {
  const { addReview } = useReviews(productId);
  const [content, setContent] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      await addReview({
        content,
        userId: userId || null, // null for guest reviews
      });
      setContent('');
      alert('Review submitted successfully!');
    } catch (error) {
      alert('Failed to submit review: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your review..."
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

// ============================================================================
// Example 4: User's Reviews Page
// ============================================================================

function UserReviewsPage({ userId }) {
  const { reviews, loading, error } = useUserReviews(userId);

  if (loading) return <div>Loading your reviews...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Reviews</h1>
      {reviews.length === 0 ? (
        <p>You haven't written any reviews yet.</p>
      ) : (
        reviews.map(review => (
          <div key={review._id} className="review-card">
            {/* Product info */}
            {review.product && (
              <div className="product-info">
                <img src={review.product.imageUrls[0]} alt={review.product.name} />
                <h3>{review.product.name}</h3>
              </div>
            )}
            
            {/* Review content */}
            <p>{review.content}</p>
            <small>{new Date(review.createdAt).toLocaleDateString()}</small>
          </div>
        ))
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Edit & Delete Reviews
// ============================================================================

function EditableReview({ review, currentUserId }) {
  const { editReview, removeReview } = useReviews(review.productId);
  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState(review.content);

  const handleUpdate = async () => {
    try {
      await editReview(review._id, { content });
      setIsEditing(false);
      alert('Review updated!');
    } catch (error) {
      alert('Failed to update: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this review?')) {
      try {
        await removeReview(review._id);
        alert('Review deleted!');
      } catch (error) {
        alert('Failed to delete: ' + error.message);
      }
    }
  };

  // Only show edit/delete for own reviews
  const canEdit = review.userId === currentUserId;

  return (
    <div className="review">
      {isEditing ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <p>{review.content}</p>
          {canEdit && (
            <div>
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// Example 6: Using Service Functions Directly
// ============================================================================

async function exampleServiceUsage() {
  // Get reviews for a product
  const { reviews, total } = await getProductReviews('product123', {
    limit: 10,
    skip: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  console.log(`Found ${total} reviews`, reviews);

  // Create a new review
  const newReview = await createReview('product123', {
    content: 'This product is amazing!',
    userId: 'user1' // or null for guest
  });
  console.log('Created review:', newReview);

  // Update a review
  const updated = await updateReview('review123', {
    content: 'Updated review content'
  });
  console.log('Updated review:', updated);

  // Delete a review
  await deleteReview('review123');
  console.log('Review deleted');
}

// ============================================================================
// Example 7: Complete Product Page with Reviews
// ============================================================================

function ProductDetailPage({ productId }) {
  // Get current user from auth context
  const currentUserId = 'user1'; // Replace with actual auth state

  return (
    <div className="product-page">
      {/* Product details section */}
      <div className="product-details">
        <h1>Product Name</h1>
        {/* Product info, images, etc. */}
      </div>

      {/* Reviews section using the complete ReviewList component */}
      <div className="product-reviews">
        <ReviewList 
          productId={productId}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 8: Check if User Has Reviewed
// ============================================================================

function ReviewPrompt({ productId, userId }) {
  const { checkUserReview } = useReviews(productId);
  const [hasReviewed, setHasReviewed] = React.useState(false);

  React.useEffect(() => {
    checkUserReview(userId).then(setHasReviewed);
  }, [userId, checkUserReview]);

  if (hasReviewed) {
    return <p>Thank you for your review!</p>;
  }

  return (
    <div>
      <p>You haven't reviewed this product yet.</p>
      <CreateReviewForm productId={productId} userId={userId} />
    </div>
  );
}

// Export examples (for reference only)
export {
  SimpleProductReviews,
  ReviewsWithPagination,
  CreateReviewForm,
  UserReviewsPage,
  EditableReview,
  exampleServiceUsage,
  ProductDetailPage,
  ReviewPrompt,
};
