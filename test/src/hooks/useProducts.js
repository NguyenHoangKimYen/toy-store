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
        
        // Extract products array if response is wrapped
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          // Backend returns: { products: [...], pagination: {...} }
          // handleResponse already extracted 'data', so we get the products array
          if (result.products && Array.isArray(result.products)) {
            result = result.products;
          }
        }
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

        // Featured products - filter by isFeatured
        if (featured) {
          keys.push('featured');
          requests.push(
            getProducts({ isFeatured: 'true', ...featured })
              .then(response => {
                // Handle response from backend (might be wrapped in data object)
                const products = response?.data?.products || response?.products || response?.data || response;
                return Array.isArray(products) ? products : [];
              })
          );
        }

        // New products - sort by createdAt descending (most recent first)
        if (newProducts) {
          keys.push('newProducts');
          requests.push(
            getProducts({ sort: 'createdAt:desc', ...newProducts })
              .then(response => {
                const products = response?.data?.products || response?.products || response?.data || response;
                return Array.isArray(products) ? products : [];
              })
          );
        }

        // Best sellers - sort by totalUnitsSold descending
        if (bestSellers) {
          keys.push('bestSellers');
          requests.push(
            getProducts({ sort: 'totalUnitsSold:desc', ...bestSellers })
              .then(response => {
                const products = response?.data?.products || response?.products || response?.data || response;
                return Array.isArray(products) ? products : [];
              })
          );
        }

        // Category-based products - only if categories are provided
        if (categories && categories.length > 0) {
          categories.forEach(({ key, categoryId, category, ...params }) => {
            keys.push(key);
            // Support both categoryId and category params for backwards compatibility
            const catParam = categoryId || category;
            requests.push(
              getProducts({ categoryId: catParam, ...params })
                .then(response => {
                  const products = response?.data?.products || response?.products || response?.data || response;
                  return Array.isArray(products) ? products : [];
                })
            );
          });
        }

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
  const { data: product, loading: productLoading, error, refetch } = useProducts({ productId });
  
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch variants when product loads
  useEffect(() => {
    const fetchVariants = async () => {
      if (!product?._id) return;
      
      try {
        setVariantsLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const url = `${API_BASE_URL}/api/products/${product._id}/variants`;
        console.log('Fetching variants from:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        console.log('Variants fetched:', data);
        
        setVariants(data.variants || []);
        
        // Don't auto-select - user must choose all attributes first
        setSelectedVariant(null);
      } catch (err) {
        console.error('Error fetching variants:', err);
      } finally {
        setVariantsLoading(false);
      }
    };

    fetchVariants();
  }, [product]);

  const handleVariantChange = useCallback((variant) => {
    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1);
    }
  }, []);

  const handleQuantityChange = useCallback((delta) => {
    const newQuantity = quantity + delta;
    const maxStock = selectedVariant?.stockQuantity || 0;
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  }, [quantity, selectedVariant]);

  // Calculated values
  const price = selectedVariant?.price?.$numberDecimal || selectedVariant?.price || 0;
  const stock = selectedVariant?.stockQuantity || 0;
  const inStock = stock > 0 && selectedVariant?.isActive;
  
  // For discount calculation, compare to highest price variant if multiple exist
  const maxVariantPrice = variants.length > 0 
    ? Math.max(...variants.map(v => parseFloat(v.price?.$numberDecimal || v.price || 0)))
    : price;
  const discount = maxVariantPrice && price && maxVariantPrice > price 
    ? Math.round(((maxVariantPrice - price) / maxVariantPrice) * 100) 
    : 0;

  return {
    product,
    loading: productLoading || variantsLoading,
    error,
    refetch,
    variants,
    selectedVariant,
    quantity,
    price,
    originalPrice: discount > 0 ? maxVariantPrice : null,
    stock,
    inStock,
    discount,
    handleVariantChange,
    handleQuantityChange,
    setQuantity,
  };
};
