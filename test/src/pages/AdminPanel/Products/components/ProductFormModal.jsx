import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AttributeDefinitionBuilder from './AttributeDefinitionBuilder';
import VariantList from './VariantList';
import CategoryManager from './CategoryManager';
import ImageGalleryManager from './ImageGalleryManager';

const ProductFormModal = ({ product, isOpen, onClose, onSave, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    isFeatured: false,
    imageUrls: [],
    categoryId: [],
    variants: [],
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [attributeDefinitions, setAttributeDefinitions] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product && mode === 'edit') {
      const convertedVariants = (product.variants || []).map(v => {
        if (Array.isArray(v.attributes)) {
          const attributesObj = {};
          v.attributes.forEach(attr => {
            attributesObj[attr.name] = attr.value;
          });
          return { ...v, attributes: attributesObj };
        }
        return { ...v, attributes: v.attributes || {} };
      });
      
      // Extract attribute definitions from existing variants
      if (convertedVariants.length > 0) {
        const attrMap = {};
        convertedVariants.forEach(variant => {
          Object.entries(variant.attributes).forEach(([key, value]) => {
            if (!attrMap[key]) {
              attrMap[key] = new Set();
            }
            attrMap[key].add(value);
          });
        });
        
        const definitions = Object.entries(attrMap).map(([name, valuesSet]) => ({
          name,
          values: Array.from(valuesSet),
        }));
        
        setAttributeDefinitions(definitions);
      }

      setFormData({
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
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

  const addCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoryId: [...prev.categoryId, categoryId],
    }));
  };

  const removeCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      categoryId: prev.categoryId.filter((_, i) => i !== index),
    }));
  };

  const addImage = () => {
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

  const generateVariants = () => {
    if (attributeDefinitions.length === 0) return;
    
    const generateCombinations = (arrays) => {
      if (arrays.length === 0) return [[]];
      const [first, ...rest] = arrays;
      const restCombinations = generateCombinations(rest);
      return first.flatMap(value =>
        restCombinations.map(combo => [value, ...combo])
      );
    };
    
    const attrValues = attributeDefinitions.map(attr => 
      attr.values.map(val => ({ name: attr.name, value: val }))
    );
    
    const combinations = generateCombinations(attrValues);
    
    const newVariants = combinations.map((combo, index) => {
      const attributes = {};
      combo.forEach(attr => {
        attributes[attr.name] = attr.value;
      });
      
      return {
        _id: `var_${Date.now()}_${index}`,
        attributes,
        price: { $numberDecimal: '0' },
        stock: 0,
        isActive: true,
      };
    });
    
    setFormData(prev => ({
      ...prev,
      variants: newVariants,
    }));
  };

  const updateVariantPrice = (index, price) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, price: { $numberDecimal: price } } : v
      ),
    }));
  };

  const updateVariantStock = (index, stock) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, stock: parseInt(stock) || 0 } : v
      ),
    }));
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
    
    if (formData.categoryId.length === 0) {
      newErrors.categoryId = 'At least one category is required';
    }
    
    if (formData.variants.length === 0) {
      newErrors.variants = 'At least one variant is required';
    } else {
      const hasInvalidVariant = formData.variants.some(
        v => !v.price.$numberDecimal || parseFloat(v.price.$numberDecimal) <= 0
      );
      if (hasInvalidVariant) {
        newErrors.variants = 'All variants must have valid prices';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setSaving(true);
    try {
      // Don't transform here - let useAdminProducts handle the transformation
      await onSave(formData);
      toast.success(`Product ${mode === 'create' ? 'created' : 'updated'} successfully`);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
            <X className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Basic Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Product Name *</label>
              <Input
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Enter product name'
              />
              {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Brand</label>
              <Input
                name='brand'
                value={formData.brand}
                onChange={handleInputChange}
                placeholder='Enter brand name'
              />
            </div>
          </div>

          <div>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Description *</label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Enter product description'
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
            />
            {errors.description && <p className='text-red-500 text-sm mt-1'>{errors.description}</p>}
          </div>

          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              name='isFeatured'
              checked={formData.isFeatured}
              onChange={handleInputChange}
              className='w-4 h-4'
            />
            <label className='text-sm text-gray-700 dark:text-gray-300'>Featured Product</label>
          </div>

          {/* Categories */}
          <div>
            <CategoryManager
              categories={formData.categoryId}
              onAdd={addCategory}
              onRemove={removeCategory}
            />
            {errors.categoryId && <p className='text-red-500 text-sm mt-1'>{errors.categoryId}</p>}
          </div>

          {/* Images */}
          <div>
            <ImageGalleryManager
              images={formData.imageUrls}
              newImageUrl={newImageUrl}
              onAddImage={addImage}
              onRemoveImage={removeImage}
              onImageUrlChange={(e) => setNewImageUrl(e.target.value)}
            />
            {errors.imageUrls && <p className='text-red-500 text-sm mt-1'>{errors.imageUrls}</p>}
          </div>

          {/* Variants */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Product Variants *</h3>
            
            <AttributeDefinitionBuilder
              attributeDefinitions={attributeDefinitions}
              setAttributeDefinitions={setAttributeDefinitions}
              onGenerateVariants={generateVariants}
            />

            {errors.variants && <p className='text-red-500 text-sm'>{errors.variants}</p>}

            <VariantList
              variants={formData.variants}
              onUpdatePrice={updateVariantPrice}
              onUpdateStock={updateVariantStock}
              onRemove={removeVariant}
            />
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
