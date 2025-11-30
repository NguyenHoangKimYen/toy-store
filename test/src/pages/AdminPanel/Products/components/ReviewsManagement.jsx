import React, { useState, useEffect, useMemo } from 'react';
import { Star, Trash2, Search, Filter, User, Package, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all reviews (admin)
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get reviews for all products - we'll need to aggregate from products
      const response = await apiClient.get('/reviews/admin/all');
      setReviews(response.metadata?.reviews || response.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      // Fallback: Try fetching from a different endpoint or show error
      setError('Failed to load reviews. Admin endpoint may not exist.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const userName = review.userId?.fullName || review.userId?.username || '';
        const productName = review.productId?.name || '';
        if (!userName.toLowerCase().includes(query) && !productName.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && review.status !== statusFilter) {
        return false;
      }

      // Rating filter
      if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) {
        return false;
      }

      return true;
    });
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const flagged = reviews.filter(r => r.status === 'flagged').length;
    const avgRating = total > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(1) 
      : 0;

    return { total, approved, pending, flagged, avgRating };
  }, [reviews]);

  const handleDeleteReview = (review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      setDeleting(true);
      await apiClient.delete(`/reviews/admin/${reviewToDelete._id}`);
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

  const handleModerateReview = async (reviewId, status) => {
    try {
      await apiClient.patch(`/reviews/${reviewId}/moderate`, { status });
      setReviews(prev => prev.map(r => 
        r._id === reviewId ? { ...r, status } : r
      ));
      toast.success(`Review ${status}`);
    } catch (err) {
      console.error('Failed to moderate review:', err);
      toast.error('Failed to update review status');
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
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={14}
        className={index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle size={12} className="mr-1" /> Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><AlertTriangle size={12} className="mr-1" /> Pending</Badge>;
      case 'flagged':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle size={12} className="mr-1" /> Flagged</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">Total Reviews</div>
          <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">Approved</div>
          <div className="text-2xl font-semibold text-green-600">{stats.approved}</div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">Pending</div>
          <div className="text-2xl font-semibold text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">Flagged</div>
          <div className="text-2xl font-semibold text-red-600">{stats.flagged}</div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">Avg Rating</div>
          <div className="text-2xl font-semibold text-slate-900 flex items-center gap-1">
            {stats.avgRating} <Star size={18} className="text-yellow-400 fill-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user or product name..."
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full md:w-40">
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
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
          <p className="mt-2 text-sm text-red-500">
            The admin reviews endpoint needs to be created on the backend. 
            Add GET /api/reviews/admin/all to fetch all reviews.
          </p>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            <Star size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No reviews found</p>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review._id} className="p-4 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* User Info */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {review.userId?.avatar ? (
                      <img src={review.userId.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      {review.userId?.fullName || review.userId?.username || 'Anonymous'}
                    </div>
                    <div className="text-xs text-slate-500">{review.userId?.email}</div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 space-y-2">
                  {/* Product Info */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Package size={14} />
                    <span className="font-medium">{review.productId?.name || 'Unknown Product'}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    {getStatusBadge(review.status)}
                  </div>

                  {/* Comment if exists */}
                  {review.comment && (
                    <p className="text-sm text-slate-700">{review.comment}</p>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar size={12} />
                    {formatDate(review.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:ml-auto">
                  {review.status === 'pending' || review.status === 'flagged' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleModerateReview(review._id, 'approved')}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleModerateReview(review._id, 'rejected')}
                      >
                        <XCircle size={14} className="mr-1" />
                        Reject
                      </Button>
                    </>
                  ) : null}
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
    </div>
  );
};

export default ReviewsManagement;
