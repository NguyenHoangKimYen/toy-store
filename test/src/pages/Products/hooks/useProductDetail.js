import { useState, useEffect } from 'react';
import { getProductById } from '@/services/products.service';

/**
 * Custom hook for managing product detail state and data fetching
 */
export const useProductDetail = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(productId);
        setProduct(data);
        
        // Set default variant if available
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    const maxStock = selectedVariant?.stock || product?.stockQuantity || 0;
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  // Handle variant selection
  const handleVariantChange = (variantId) => {
    const variant = product.variants.find(v => v._id === variantId);
    setSelectedVariant(variant);
    setQuantity(1);
  };

  // Calculate derived values
  const price = selectedVariant?.price || product?.price?.$numberDecimal || product?.price;
  const originalPrice = selectedVariant?.originalPrice || product?.originalPrice?.$numberDecimal || product?.originalPrice;
  const stock = selectedVariant?.stock || product?.stockQuantity || 0;
  const inStock = stock > 0;
  const discount = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return {
    product,
    loading,
    error,
    selectedVariant,
    quantity,
    isFavorite,
    price,
    originalPrice,
    stock,
    inStock,
    discount,
    setIsFavorite,
    handleQuantityChange,
    handleVariantChange,
  };
};
