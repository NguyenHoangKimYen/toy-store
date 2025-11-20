import React, { useState, useEffect } from 'react'
import { X, Edit, Trash2, ExternalLink, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getProductVariants } from '@/services/products.service'
import ProductImageGallery from './ProductImageGallery'
import ProductInfo from './ProductInfo'
import ProductDescription from './ProductDescription'
import ProductMetadata from './ProductMetadata'
import ProductFormModal from './ProductFormModal'
import VariantManager from './VariantManager'

const ProductDetailModal = ({ product, onClose, onEdit, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [variants, setVariants] = useState(product.variants || []);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const navigate = useNavigate();

  // Fetch variants when modal opens
  useEffect(() => {
    const fetchVariants = async () => {
      if (!product._id) return;
      
      try {
        setLoadingVariants(true);
        const data = await getProductVariants(product._id);
        setVariants(data.variants || data || []);
      } catch (error) {
        console.error('Error fetching variants:', error);
        setVariants(product.variants || []);
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchVariants();
  }, [product._id, product.variants]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedData) => {
    await onEdit(product._id, updatedData);
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await onDelete(product._id);
    setShowDeleteDialog(false);
    onClose();
  };

  const handleViewProduct = () => {
    navigate(`/products/${product._id}`);
  };

  const handleViewReviews = () => {
    // TODO: Implement reviews view
    console.log('View reviews for product:', product._id);
  };

  return (
    <>
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
        <div className='bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
          {/* Header */}
          <div className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10'>
            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Product Details</h2>
            <div className='flex items-center gap-2'>
              <Button onClick={handleViewProduct} variant='outline' size='sm'>
                <ExternalLink className='w-4 h-4 mr-2' />
                View Page
              </Button>
              <Button onClick={handleViewReviews} variant='outline' size='sm'>
                <MessageSquare className='w-4 h-4 mr-2' />
                Reviews
              </Button>
              <Button onClick={handleEdit} variant='outline' size='sm'>
                <Edit className='w-4 h-4 mr-2' />
                Edit
              </Button>
              <Button onClick={() => setShowDeleteDialog(true)} variant='destructive' size='sm'>
                <Trash2 className='w-4 h-4 mr-2' />
                Delete
              </Button>
              <button 
                onClick={onClose}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2'
              >
                <X className='w-6 h-6' />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              {/* Image Gallery */}
              <ProductImageGallery images={product.imageUrls} productName={product.name} />
              
              {/* Product Info */}
              <ProductInfo product={{ ...product, variants }} />
            </div>

            {/* Description */}
            <ProductDescription description={product.description} />

            {/* Variants Section */}
            <div className='mt-6'>
              {loadingVariants ? (
                <div className='text-center py-4'>Loading variants...</div>
              ) : (
                <VariantManager
                  productId={product._id}
                  variants={variants}
                  onUpdate={async () => {
                    // Refresh variants after update
                    try {
                      const data = await getProductVariants(product._id);
                      setVariants(data.variants || data || []);
                    } catch (error) {
                      console.error('Error refreshing variants:', error);
                    }
                  }}
                />
              )}
            </div>

            {/* Metadata */}
            <ProductMetadata createdAt={product.createdAt} updatedAt={product.updatedAt} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ProductFormModal
          product={product}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          mode='edit'
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-red-600 hover:bg-red-700'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ProductDetailModal
