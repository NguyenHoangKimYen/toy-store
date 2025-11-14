import { useState, useEffect, useCallback } from 'react';
import { getProducts, getProductById } from '@/services/products.service';

/**
 * Universal hook for fetching products with flexible options
 * @param {Object} options - Configuration options
 * @param {Object} options.params - Query parameters for getProducts
 * @param {string} options.productId - Single product ID to fetch
 * @param {boolean} options.enabled - Whether to auto-fetch (default: true)
 * @param {Array} options.dependencies - Additional dependencies for refetch
 * @returns {Object} Product data and utilities
 */
export const useProducts = (options = {}) => {
  const {
    params = {},
    productId = null,
    enabled = true,
    dependencies = [],
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stringify params for stable dependency
  const paramsKey = JSON.stringify(params);
  const depsKey = JSON.stringify(dependencies);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (productId) {
        // Fetch single product
        result = await getProductById(productId);
      } else {
        // Fetch multiple products
        result = await getProducts(params);
      }

      setData(result);
      return result;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, paramsKey, depsKey]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Manual refetch function
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching categorized products (Home page use case)
 * @param {Object} options - Category configuration
 * @returns {Object} Categorized products with loading state
 */
export const useCategorizedProducts = (options = {}) => {
  const {
    featured = { limit: 6 },
    newProducts = { limit: 8 },
    bestSellers = { limit: 12 },
    categories = [], // Array of category objects: [{ key: 'keychains', category: 'keychains', limit: 12 }]
  } = options;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorizedProducts, setCategorizedProducts] = useState({});

  // Stringify config for stable dependency
  const configKey = JSON.stringify({ featured, newProducts, bestSellers, categories });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const requests = [];
        const keys = [];

        // Featured products
        if (featured) {
          keys.push('featured');
          requests.push(
            getProducts({ isFeatured: true, ...featured })
              .then(products => Array.isArray(products) ? products : [])
          );
        }

        // New products
        if (newProducts) {
          keys.push('newProducts');
          requests.push(
            getProducts({ isNew: true, ...newProducts })
              .then(products => Array.isArray(products) ? products : [])
          );
        }

        // Best sellers
        if (bestSellers) {
          keys.push('bestSellers');
          requests.push(
            getProducts({ isBestSeller: true, ...bestSellers })
              .then(products => Array.isArray(products) ? products : [])
          );
        }

        // Category-based products
        categories.forEach(({ key, category, ...params }) => {
          keys.push(key);
          requests.push(
            getProducts({ category, ...params })
              .then(products => Array.isArray(products) ? products : [])
          );
        });

        const results = await Promise.all(requests);

        // Map results to keys
        const categorized = {};
        keys.forEach((key, index) => {
          categorized[key] = results[index];
        });

        setCategorizedProducts(categorized);
      } catch (err) {
        console.error('Error fetching categorized products:', err);
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey]);

  return {
    categorizedProducts,
    loading,
    error,
  };
};

/**
 * Hook for single product detail with variant management
 * @param {string} productId - Product ID
 * @returns {Object} Product detail with variant utilities
 */
export const useProductDetail = (productId) => {
  const { data: product, loading, error, refetch } = useProducts({ productId });
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Set default variant when product loads
  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const handleVariantChange = useCallback((variantId) => {
    const variant = product?.variants?.find(v => v._id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1);
    }
  }, [product]);

  const handleQuantityChange = useCallback((delta) => {
    const newQuantity = quantity + delta;
    const maxStock = selectedVariant?.stock || product?.stockQuantity || 0;
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  }, [quantity, selectedVariant, product]);

  // Calculated values
  const price = selectedVariant?.price || product?.minPrice || product?.price?.$numberDecimal || product?.price;
  const originalPrice = selectedVariant?.originalPrice || product?.maxPrice || product?.originalPrice?.$numberDecimal || product?.originalPrice;
  const stock = selectedVariant?.stock || product?.stockQuantity || 0;
  const inStock = stock > 0;
  const discount = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return {
    product,
    loading,
    error,
    refetch,
    selectedVariant,
    quantity,
    price,
    originalPrice,
    stock,
    inStock,
    discount,
    handleVariantChange,
    handleQuantityChange,
    setQuantity,
  };
};
