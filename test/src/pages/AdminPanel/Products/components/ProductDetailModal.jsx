import React, { useState } from 'react'
import { X, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductImageGallery from './ProductImageGallery'
import ProductInfo from './ProductInfo'
import ProductDescription from './ProductDescription'
import ProductMetadata from './ProductMetadata'
import ProductFormModal from './ProductFormModal'

const ProductDetailModal = ({ product, onClose, onEdit, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedData) => {
    await onEdit(product._id, updatedData);
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      await onDelete(product._id);
      onClose();
    }
  };

  return (
    <>
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
        <div className='bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
          {/* Header */}
          <div className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10'>
            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Product Details</h2>
            <div className='flex items-center gap-2'>
              <Button onClick={handleEdit} variant='outline' size='sm'>
                <Edit className='w-4 h-4 mr-2' />
                Edit
              </Button>
              <Button onClick={handleDelete} variant='destructive' size='sm'>
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
              <ProductInfo product={product} />
            </div>

            {/* Description */}
            <ProductDescription description={product.description} />

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
    </>
  )
}

export default ProductDetailModal
