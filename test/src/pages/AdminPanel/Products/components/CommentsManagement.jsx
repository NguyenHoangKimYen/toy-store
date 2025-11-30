import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Trash2, Search, User, Package, Calendar, AlertTriangle, CheckCircle, XCircle, Image } from 'lucide-react';
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

const CommentsManagement = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch all comments (admin)
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/comments/admin/all');
      setComments(response.metadata?.comments || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Failed to load comments.');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // Filter comments
  const filteredComments = useMemo(() => {
    return comments.filter(comment => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const userName = comment.userId?.fullName || comment.userId?.username || comment.guestName || '';
        const productName = comment.productId?.name || '';
        const content = comment.content || '';
        if (!userName.toLowerCase().includes(query) && 
            !productName.toLowerCase().includes(query) &&
            !content.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && comment.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [comments, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = comments.length;
    const approved = comments.filter(c => c.status === 'approved').length;
    const pending = comments.filter(c => c.status === 'pending').length;
    const flagged = comments.filter(c => c.status === 'flagged').length;
    const withImages = comments.filter(c => c.imageUrls && c.imageUrls.length > 0).length;

    return { total, approved, pending, flagged, withImages };
  }, [comments]);

  const handleDeleteComment = (comment) => {
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      setDeleting(true);
      await apiClient.delete(`/comments/admin/${commentToDelete._id}`);
      setComments(prev => prev.filter(c => c._id !== commentToDelete._id));
      toast.success('Comment deleted successfully');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error('Failed to delete comment');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleModerateComment = async (commentId, status) => {
    try {
      await apiClient.patch(`/comments/${commentId}/moderate`, { status });
      setComments(prev => prev.map(c => 
        c._id === commentId ? { ...c, status } : c
      ));
      toast.success(`Comment ${status}`);
    } catch (err) {
      console.error('Failed to moderate comment:', err);
      toast.error('Failed to update comment status');
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-slate-500">Total Comments</div>
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
          <div className="text-sm text-slate-500">With Images</div>
          <div className="text-2xl font-semibold text-slate-900 flex items-center gap-1">
            {stats.withImages} <Image size={18} className="text-blue-400" />
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
                placeholder="Search by user, product, or content..."
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
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {filteredComments.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No comments found</p>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment._id} className="p-4 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* User Info */}
                <div className="flex items-center gap-3 min-w-[180px]">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {comment.userId?.avatar ? (
                      <img src={comment.userId.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      {comment.userId?.fullName || comment.userId?.username || comment.guestName || 'Anonymous'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {comment.userId?.email || comment.guestEmail || 'Guest'}
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="flex-1 space-y-2">
                  {/* Product Info */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Package size={14} />
                    <span className="font-medium">{comment.productId?.name || 'Unknown Product'}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {getStatusBadge(comment.status)}
                    {comment.imageUrls && comment.imageUrls.length > 0 && (
                      <Badge variant="outline" className="text-blue-600">
                        <Image size={12} className="mr-1" /> {comment.imageUrls.length} image{comment.imageUrls.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>

                  {/* Comment Images */}
                  {comment.imageUrls && comment.imageUrls.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {comment.imageUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Comment image ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition border border-slate-200"
                          onClick={() => openImageModal(url)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar size={12} />
                    {formatDate(comment.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:ml-auto">
                  {comment.status === 'pending' || comment.status === 'flagged' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleModerateComment(comment._id, 'approved')}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Approve
                    </Button>
                  ) : null}
                  {comment.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={() => handleModerateComment(comment._id, 'flagged')}
                    >
                      <AlertTriangle size={14} className="mr-1" />
                      Flag
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteComment(comment)}
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
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
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
            alt="Comment image" 
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

export default CommentsManagement;
