import { useState } from 'react';
import { Plus, Trash2, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
import * as productsService from '@/services/products.service';

const VariantManager = ({ productId, variants: initialVariants = [], onUpdate }) => {
  const [variants, setVariants] = useState(initialVariants);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(false);

  // New variant form state
  const [newVariant, setNewVariant] = useState({
    sku: '',
    attributes: [{ name: '', value: '' }],
    price: '',
    stockQuantity: 0,
    weight: 0,
    imageUrls: [],
  });

  const addAttributeField = () => {
    setNewVariant(prev => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', value: '' }],
    }));
  };

  const removeAttributeField = (index) => {
    setNewVariant(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const updateAttributeField = (index, field, value) => {
    setNewVariant(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  const handleAddVariant = async () => {
    try {
      // Validate
      if (!newVariant.sku.trim()) {
        toast.error('SKU is required');
        return;
      }
      if (!newVariant.price || parseFloat(newVariant.price) <= 0) {
        toast.error('Valid price is required');
        return;
      }
      
      // Filter out empty attributes
      const validAttributes = newVariant.attributes.filter(
        attr => attr.name.trim() && attr.value.trim()
      );

      setLoading(true);
      const variantData = {
        sku: newVariant.sku,
        attributes: validAttributes,
        price: parseFloat(newVariant.price),
        stockQuantity: parseInt(newVariant.stockQuantity) || 0,
        weight: parseFloat(newVariant.weight) || 0,
        imageUrls: newVariant.imageUrls,
      };

      const created = await productsService.createVariant(productId, variantData);
      
      setVariants(prev => [...prev, created]);
      toast.success('Variant added successfully');
      setShowAddModal(false);
      setNewVariant({
        sku: '',
        attributes: [{ name: '', value: '' }],
        price: '',
        stockQuantity: 0,
        weight: 0,
        imageUrls: [],
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to add variant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = async () => {
    try {
      if (!selectedVariant) return;

      setLoading(true);
      await productsService.deleteVariant(selectedVariant._id);
      
      setVariants(prev => prev.filter(v => v._id !== selectedVariant._id));
      toast.success('Variant deleted successfully');
      setShowDeleteDialog(false);
      setSelectedVariant(null);
      
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to delete variant');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    const value = price?.$numberDecimal || price;
    return value ? `$${parseFloat(value).toFixed(2)}` : 'N/A';
  };

  const formatAttributes = (attributes) => {
    if (!attributes || attributes.length === 0) return 'No attributes';
    return attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
          <PackagePlus className='w-5 h-5' />
          Product Variants ({variants.length})
        </h3>
        <Button onClick={() => setShowAddModal(true)} size='sm'>
          <Plus className='w-4 h-4 mr-2' />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className='text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700'>
          <PackagePlus className='w-12 h-12 mx-auto mb-2 text-gray-400' />
          <p className='text-gray-500 dark:text-gray-400 mb-2'>No variants yet</p>
          <Button onClick={() => setShowAddModal(true)} variant='outline' size='sm'>
            <Plus className='w-4 h-4 mr-2' />
            Add First Variant
          </Button>
        </div>
      ) : (
        <div className='grid gap-3'>
          {variants.map((variant) => (
            <div
              key={variant._id}
              className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700'
            >
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-1'>
                  <span className='font-mono text-sm font-semibold text-gray-900 dark:text-white'>
                    {variant.sku}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    variant.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {variant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {formatAttributes(variant.attributes)}
                </p>
                <div className='flex items-center gap-4 mt-2 text-sm'>
                  <span className='font-medium text-gray-900 dark:text-white'>
                    {formatPrice(variant.price)}
                  </span>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Stock: {variant.stockQuantity || 0}
                  </span>
                  {variant.weight > 0 && (
                    <span className='text-gray-600 dark:text-gray-400'>
                      Weight: {variant.weight}kg
                    </span>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  onClick={() => {
                    setSelectedVariant(variant);
                    setShowDeleteDialog(true);
                  }}
                  variant='destructive'
                  size='sm'
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Variant Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Add New Variant</h3>
            </div>
            <div className='p-6 space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>SKU *</label>
                <Input
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder='e.g., PROD-001-RED-M'
                />
              </div>

              <div>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block'>
                  Attributes
                </label>
                {newVariant.attributes.map((attr, index) => (
                  <div key={index} className='flex gap-2 mb-2'>
                    <Input
                      placeholder='Name (e.g., Color)'
                      value={attr.name}
                      onChange={(e) => updateAttributeField(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder='Value (e.g., Red)'
                      value={attr.value}
                      onChange={(e) => updateAttributeField(index, 'value', e.target.value)}
                    />
                    <Button
                      onClick={() => removeAttributeField(index)}
                      variant='destructive'
                      size='sm'
                      disabled={newVariant.attributes.length === 1}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                ))}
                <Button onClick={addAttributeField} variant='outline' size='sm'>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Attribute
                </Button>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Price *</label>
                  <Input
                    type='number'
                    step='0.01'
                    min='0'
                    value={newVariant.price}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                    placeholder='0.00'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Stock</label>
                  <Input
                    type='number'
                    min='0'
                    value={newVariant.stockQuantity}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    placeholder='0'
                  />
                </div>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Weight (kg)</label>
                <Input
                  type='number'
                  step='0.01'
                  min='0'
                  value={newVariant.weight}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder='0.00'
                />
              </div>
            </div>
            <div className='flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700'>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setNewVariant({
                    sku: '',
                    attributes: [{ name: '', value: '' }],
                    price: '',
                    stockQuantity: 0,
                    weight: 0,
                    imageUrls: [],
                  });
                }}
                variant='outline'
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleAddVariant} disabled={loading}>
                {loading ? 'Adding...' : 'Add Variant'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete variant "{selectedVariant?.sku}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVariant} disabled={loading} className='bg-red-600 hover:bg-red-700'>
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VariantManager;
