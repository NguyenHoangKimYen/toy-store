import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const ProductFormModal = ({ product, isOpen, onClose, onSave, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    stockQuantity: 0,
    isNew: false,
    isFeatured: false,
    imageUrls: [],
    categoryId: [],
    variants: [],
  });

  const [newCategory, setNewCategory] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVariant, setNewVariant] = useState({
    attributes: {},
    price: '',
    stock: '',
  });
  
  const [newAttribute, setNewAttribute] = useState({
    key: '',
    value: '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product && mode === 'edit') {
      // Convert attributes array to object format if needed
      const convertedVariants = (product.variants || []).map(v => {
        if (Array.isArray(v.attributes)) {
          // Convert array format [{name: 'Color', value: 'Red'}] to object format {Color: 'Red'}
          const attributesObj = {};
          v.attributes.forEach(attr => {
            attributesObj[attr.name] = attr.value;
          });
          return { ...v, attributes: attributesObj };
        }
        return { ...v, attributes: v.attributes || {} };
      });

      setFormData({
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
        stockQuantity: product.stockQuantity || 0,
        isNew: product.isNew || false,
        isFeatured: product.isFeatured || false,
        imageUrls: product.imageUrls || [],
        categoryId: product.categoryId || [],
        variants: convertedVariants,
      });
    }
  }, [product, mode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseInt(value) || 0,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      const categoryObj = {
        _id: `cat_${Date.now()}`,
        name: newCategory.trim(),
      };
      setFormData(prev => ({
        ...prev,
        categoryId: [...prev.categoryId, categoryObj],
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      categoryId: prev.categoryId.filter((_, i) => i !== index),
    }));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const addVariant = () => {
    if (Object.keys(newVariant.attributes).length > 0 && newVariant.price) {
      const variant = {
        _id: `var_${Date.now()}`,
        attributes: { ...newVariant.attributes },
        price: { $numberDecimal: newVariant.price },
        stock: parseInt(newVariant.stock) || 0,
        isActive: true,
      };
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, variant],
      }));
      setNewVariant({ attributes: {}, price: '', stock: '' });
    }
  };
  
  const addAttributeToVariant = () => {
    if (newAttribute.key.trim() && newAttribute.value.trim()) {
      setNewVariant(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [newAttribute.key.trim()]: newAttribute.value.trim(),
        },
      }));
      setNewAttribute({ key: '', value: '' });
    }
  };
  
  const removeAttributeFromVariant = (key) => {
    setNewVariant(prev => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[key];
      return {
        ...prev,
        attributes: newAttributes,
      };
    });
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.imageUrls.length === 0) {
      newErrors.imageUrls = 'At least one image is required';
    }
    
    if (formData.variants.length === 0) {
      newErrors.variants = 'At least one variant is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Calculate min/max prices from variants
      const prices = formData.variants.map(v => 
        parseFloat(v.price.$numberDecimal || v.price)
      );
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const productData = {
        ...formData,
        minPrice: { $numberDecimal: minPrice.toString() },
        maxPrice: { $numberDecimal: maxPrice.toString() },
      };

      await onSave(productData);
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
      <div className='bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8'>
        {/* Header */}
        <div className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button 
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Basic Info */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Basic Information</h3>
            
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Product Name *
              </label>
              <Input
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Enter product name'
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Description *
              </label>
              <textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='Enter product description'
                rows={4}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.description && <p className='text-red-500 text-sm mt-1'>{errors.description}</p>}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Brand
                </label>
                <Input
                  name='brand'
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder='Enter brand name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Stock Quantity
                </label>
                <Input
                  name='stockQuantity'
                  type='number'
                  value={formData.stockQuantity}
                  onChange={handleNumberChange}
                  placeholder='0'
                  min='0'
                />
              </div>
            </div>

            <div className='flex gap-6'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  name='isNew'
                  checked={formData.isNew}
                  onChange={handleInputChange}
                  className='w-4 h-4 text-blue-600 rounded'
                />
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Mark as New</span>
              </label>

              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  name='isFeatured'
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className='w-4 h-4 text-blue-600 rounded'
                />
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Mark as Featured</span>
              </label>
            </div>
          </div>

          {/* Categories */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Categories</h3>
            
            <div className='flex gap-2'>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder='Enter category name'
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
              />
              <Button type='button' onClick={addCategory} size='sm'>
                <Plus className='w-4 h-4' />
              </Button>
            </div>

            <div className='flex flex-wrap gap-2'>
              {formData.categoryId.map((cat, index) => (
                <Badge key={index} variant='secondary' className='flex items-center gap-1'>
                  {cat.name || cat}
                  <button
                    type='button'
                    onClick={() => removeCategory(index)}
                    className='text-gray-500 hover:text-gray-700'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Product Images *</h3>
            
            <div className='flex gap-2'>
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder='Enter image URL'
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
              />
              <Button type='button' onClick={addImageUrl} size='sm'>
                <Upload className='w-4 h-4' />
              </Button>
            </div>

            {errors.imageUrls && <p className='text-red-500 text-sm'>{errors.imageUrls}</p>}

            <div className='grid grid-cols-4 gap-4'>
              {formData.imageUrls.map((url, index) => (
                <div key={index} className='relative group'>
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className='w-full h-24 object-cover rounded-lg border border-gray-200'
                  />
                  <button
                    type='button'
                    onClick={() => removeImage(index)}
                    className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Variants */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Product Variants *</h3>
            
            {/* Add Attributes to Current Variant */}
            <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3'>
              <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>Add Variant Attributes</h4>
              
              <div className='grid grid-cols-3 gap-2'>
                <Input
                  value={newAttribute.key}
                  onChange={(e) => setNewAttribute({...newAttribute, key: e.target.value})}
                  placeholder='Attribute name (e.g., Color, Size, Material)'
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttributeToVariant())}
                />
                <Input
                  value={newAttribute.value}
                  onChange={(e) => setNewAttribute({...newAttribute, value: e.target.value})}
                  placeholder='Attribute value'
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttributeToVariant())}
                />
                <Button type='button' onClick={addAttributeToVariant} size='sm' className='w-full'>
                  <Plus className='w-4 h-4 mr-1' />
                  Add Attribute
                </Button>
              </div>

              {/* Current Variant Attributes */}
              {Object.keys(newVariant.attributes).length > 0 && (
                <div className='flex flex-wrap gap-2 pt-2'>
                  {Object.entries(newVariant.attributes).map(([key, value]) => (
                    <Badge key={key} variant='secondary' className='flex items-center gap-1'>
                      <span className='font-semibold'>{key}:</span> {value}
                      <button
                        type='button'
                        onClick={() => removeAttributeFromVariant(key)}
                        className='text-gray-500 hover:text-gray-700 ml-1'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Variant Price and Stock */}
              <div className='grid grid-cols-3 gap-2'>
                <Input
                  type='number'
                  value={newVariant.price}
                  onChange={(e) => setNewVariant({...newVariant, price: e.target.value})}
                  placeholder='Price *'
                  step='0.01'
                  min='0'
                />
                <Input
                  type='number'
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({...newVariant, stock: e.target.value})}
                  placeholder='Stock'
                  min='0'
                />
                <Button 
                  type='button' 
                  onClick={addVariant} 
                  size='sm' 
                  className='w-full bg-green-600 hover:bg-green-700'
                  disabled={Object.keys(newVariant.attributes).length === 0 || !newVariant.price}
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Add Variant
                </Button>
              </div>
            </div>

            {errors.variants && <p className='text-red-500 text-sm'>{errors.variants}</p>}

            {/* Saved Variants List */}
            <div className='space-y-2'>
              {formData.variants.map((variant, index) => (
                <div key={index} className='flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                  <div className='flex-1 space-y-2'>
                    {/* Attributes */}
                    <div className='flex flex-wrap gap-2'>
                      {Object.entries(variant.attributes || {}).map(([key, value]) => (
                        <Badge key={key} variant='outline' className='text-xs'>
                          <span className='font-semibold'>{key}:</span> {value}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Price and Stock */}
                    <div className='flex gap-4 text-sm'>
                      <div>
                        <span className='text-gray-600 dark:text-gray-400'>Price:</span>
                        <span className='ml-2 font-medium text-gray-900 dark:text-white'>
                          ${variant.price.$numberDecimal || variant.price}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-600 dark:text-gray-400'>Stock:</span>
                        <span className='ml-2 font-medium text-gray-900 dark:text-white'>{variant.stock || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type='button'
                    onClick={() => removeVariant(index)}
                    className='text-red-500 hover:text-red-700 p-1'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <Button type='button' variant='outline' onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type='submit' disabled={saving} className='bg-blue-600 hover:bg-blue-700'>
              <Save className='w-4 h-4 mr-2' />
              {saving ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
