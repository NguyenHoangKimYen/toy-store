import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as productsService from '@/services/products.service';
import { parsePrice } from '@/utils/priceUtils';

/**
 * Universal hook for fetching products with flexible options
 * Supports both read operations and CRUD for admin use
 * @param {Object} options - Configuration options
 * @param {Object} options.params - Query parameters for getProducts (supports all backend filters)
 * @param {string} options.productId - Single product ID to fetch
 * @param {boolean} options.enabled - Whether to auto-fetch (default: true)
 * @param {Array} options.dependencies - Additional dependencies for refetch
 * @returns {Object} Product data and utilities
 * 
 * Supported params:
 * - keyword: Search in name and slug
 * - categoryId: Filter by category ID
 * - minPrice, maxPrice: Price range filter
 * - minRating: Minimum rating filter
 * - isFeatured: 'true' for featured products
 * - status: 'Published', 'Draft', 'Archived', or 'all'
 * - daysAgo: Filter by creation date (last N days)
 * - sort: Sort field and direction (e.g., 'createdAt:desc', 'minPrice:asc')
 * - page, limit: Pagination
 */
export const useProducts = (options = {}) => {
  const {
    params = {},
    productId = null,
    enabled = true,
    dependencies = [],
  } = options;

  const [data, setData] = useState(productId ? null : []);
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
        result = await productsService.getProductById(productId);
      } else {
        // Fetch multiple products
        result = await productsService.getProducts(params);
        
        // Extract products array if response is wrapped
        if (result && typeof result === 'object' && !Array.isArray(result)) {
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

  // Create product
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);

      const { variants, ...productWithoutVariants } = productData;
      
      const productPayload = {
        ...productWithoutVariants,
        categoryId: Array.isArray(productData.categoryId) ? productData.categoryId : [],
        variants: [],
      };

      const newProduct = await productsService.createProduct(productPayload);
      
      // Create variants if provided
      if (variants && variants.length > 0) {
        const variantIds = [];
        for (const variant of variants) {
          try {
            const variantPayload = {
              attributes: Object.entries(variant.attributes || {}).map(([name, value]) => ({
                name,
                value: String(value),
              })),
              price: variant.price,
              stockQuantity: variant.stockQuantity || 0,
              sku: variant.sku || '',
              isActive: variant.isActive !== false,
            };
            
            const createdVariant = await productsService.createVariant(newProduct._id, variantPayload);
            variantIds.push(createdVariant._id);
          } catch (variantErr) {
            console.error('Error creating variant:', variantErr);
          }
        }
        
        if (variantIds.length > 0) {
          await productsService.patchProduct(newProduct._id, { variants: variantIds });
        }
      }
      
      await fetchData(); // Refresh list
      toast.success('Product created successfully');
      return newProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product');
      toast.error('Failed to create product', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Update product
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      setError(null);

      // Separate variants and deletedVariantIds from product data
      const { variants, deletedVariantIds, ...productWithoutVariants } = productData;

      // Delete removed variants first
      if (deletedVariantIds && deletedVariantIds.length > 0) {
        for (const variantId of deletedVariantIds) {
          try {
            await productsService.deleteVariant(variantId);
          } catch (deleteErr) {
            console.error('Error deleting variant:', deleteErr);
          }
        }
      }

      // Update product basic fields
      const allowedFields = ['name', 'slug', 'description', 'status', 'isFeatured', 'categoryId', 'brand', 'imageUrls'];
      const updatePayload = {};
      
      allowedFields.forEach(field => {
        if (productWithoutVariants[field] !== undefined) {
          updatePayload[field] = productWithoutVariants[field];
        }
      });

      const updated = await productsService.patchProduct(id, updatePayload);
      
      // Update variants if provided
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          try {
            // Check if variant has an ID (existing variant) or needs to be created
            if (variant._id && !variant._id.startsWith('var_')) {
              // Update existing variant
              const variantPayload = {
                attributes: Array.isArray(variant.attributes)
                  ? variant.attributes
                  : Object.entries(variant.attributes || {}).map(([name, value]) => ({
                      name,
                      value: String(value),
                    })),
                price: variant.price,
                stockQuantity: variant.stockQuantity ?? 0,
                isActive: variant.isActive !== false,
              };
              
              await productsService.updateVariant(variant._id, variantPayload);
            } else {
              // Create new variant
              const variantPayload = {
                attributes: Object.entries(variant.attributes || {}).map(([name, value]) => ({
                  name,
                  value: String(value),
                })),
                price: variant.price,
                stockQuantity: variant.stockQuantity ?? 0,
                sku: variant.sku || '',
                isActive: variant.isActive !== false,
              };
              
              await productsService.createVariant(id, variantPayload);
            }
          } catch (variantErr) {
            console.error('Error updating variant:', variantErr);
          }
        }
      }
      
      await fetchData(); // Refresh list
      toast.success('Product updated successfully');
      return updated;
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product');
      toast.error('Failed to update product', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Delete product
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      await productsService.deleteProduct(id);
      await fetchData(); // Refresh list
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
      toast.error('Failed to delete product', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  return {
    // For backwards compatibility with existing code
    data,
    products: Array.isArray(data) ? data : [],
    product: !Array.isArray(data) ? data : null,
    
    loading,
    error,
    
    // CRUD operations
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Refetch
    refetch: fetchData,
    refreshProducts: fetchData,
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
            productsService.getProducts({ isFeatured: 'true', ...featured })
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
            productsService.getProducts({ sort: 'createdAt:desc', ...newProducts })
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
            productsService.getProducts({ sort: 'totalUnitsSold:desc', ...bestSellers })
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
              productsService.getProducts({ categoryId: catParam, ...params })
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
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Use variants from product (already populated by backend)
  const variants = product?.variants || [];

  const handleVariantChange = useCallback((variant) => {
    setSelectedVariant(variant);
    if (variant) {
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
  const price = parsePrice(selectedVariant?.price) || 0;
  const stock = selectedVariant?.stockQuantity || 0;
  const inStock = stock > 0 && selectedVariant?.isActive;
  
  // For discount calculation, compare to highest price variant if multiple exist
  const maxVariantPrice = variants.length > 0 
    ? Math.max(...variants.map(v => parsePrice(v.price) || 0))
    : price;
  const discount = maxVariantPrice && price && maxVariantPrice > price 
    ? Math.round(((maxVariantPrice - price) / maxVariantPrice) * 100) 
    : 0;

  return {
    product, // Product already has variants populated
    loading: productLoading,
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
