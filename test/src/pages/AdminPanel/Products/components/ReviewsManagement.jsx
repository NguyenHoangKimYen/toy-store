import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trash2, User, Package, Calendar, ExternalLink, Image, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import apiClient from '@/services/config';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ReviewsManagement = ({ externalSearchQuery = '' }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(externalSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [externalSearchQuery]);

  // Fetch all reviews (admin)
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);
      if (debouncedSearch && debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
      
      const response = await apiClient.get(`/reviews/admin/all?${params.toString()}`);
      setReviews(response.metadata?.reviews || response.data?.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Failed to load reviews.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    const verified = reviews.filter(r => r.isVerifiedPurchase).length;
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    const withImages = reviews.filter(r => r.images && r.images.length > 0).length;
    const byRating = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return { total, verified, avgRating, withImages, byRating };
  }, [reviews]);

  const handleDeleteReview = (review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      setDeleting(true);
      await apiClient.delete(`/reviews/${reviewToDelete._id}`);
      setReviews(prev => prev.filter(r => r._id !== reviewToDelete._id));
      toast.success('Review deleted successfully');
    } catch (err) {
      console.error('Failed to delete review:', err);
      toast.error('Failed to delete review');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="admin-card bg-white/85 backdrop-blur-md border border-purple-100/70 rounded-2xl shadow-[0_18px_42px_-28px_rgba(124,58,237,0.22)] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">Total Reviews</div>
          <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">Avg Rating</div>
          <div className="text-2xl font-semibold text-yellow-600 flex items-center gap-1">
            {stats.avgRating} <Star size={18} className="fill-yellow-400 text-yellow-400" />
          </div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">Verified</div>
          <div className="text-2xl font-semibold text-green-600 flex items-center gap-1">
            {stats.verified} <CheckCircle size={18} />
          </div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">With Images</div>
          <div className="text-2xl font-semibold text-blue-600 flex items-center gap-1">
            {stats.withImages} <Image size={18} />
          </div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">5 Stars</div>
          <div className="text-2xl font-semibold text-yellow-600">{stats.byRating[5]}</div>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle size={20} />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            <Star size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No reviews found</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id} className="p-4 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* User Info */}
                <div className="flex items-center gap-3 min-w-[180px]">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {review.userId?.avatar ? (
                      <img src={review.userId.avatar} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <User size={20} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      {review.userId?.fullName || review.userId?.username || 'Anonymous'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {review.userId?.email || 'Guest'}
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 space-y-2">
                  {/* Product Info - Clickable */}
                  <button
                    onClick={() => {
                      const productSlug = review.productId?.slug || review.productId?._id;
                      if (productSlug) {
                        navigate(`/products/${productSlug}#review-${review._id}`);
                      }
                    }}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition group"
                  >
                    <Package size={14} />
                    <span className="font-medium">{review.productId?.name || 'Unknown Product'}</span>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition" />
                  </button>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    {review.isVerifiedPurchase && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle size={10} className="mr-1" /> Verified
                      </Badge>
                    )}
                  </div>

                  {/* Review Text */}
                  {review.review && (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.review}</p>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Review image ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition border border-slate-200"
                          onClick={() => openImageModal(url)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar size={12} />
                    {formatDate(review.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:ml-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteReview(review)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <img 
            src={selectedImage} 
            alt="Review image" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            onClick={() => setImageModalOpen(false)}
          >
            <XCircle size={32} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;
