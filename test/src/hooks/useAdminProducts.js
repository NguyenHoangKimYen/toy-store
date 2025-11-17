import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as productsService from '@/services/products.service';
import { mockProducts } from '@/mocks/mockProducts';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Local storage key for mock products
const MOCK_PRODUCTS_STORAGE_KEY = 'admin_mock_products';

/**
 * Hook for admin product management with mock/real API toggle
 */
export const useAdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize products from mock data or API
  const loadProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        // Get from localStorage or initialize with mock data
        const storedProducts = localStorage.getItem(MOCK_PRODUCTS_STORAGE_KEY);
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        } else {
          // Initialize with mock data
          const allProducts = [
            ...mockProducts.featured,
            ...mockProducts.bestSellers,
            ...mockProducts.keychains,
            ...mockProducts.plushToys,
            ...mockProducts.accessories,
            ...mockProducts.newProducts,
          ];
          // Remove duplicates
          const uniqueProducts = Array.from(
            new Map(allProducts.map(p => [p._id, p])).values()
          );
          setProducts(uniqueProducts);
          localStorage.setItem(MOCK_PRODUCTS_STORAGE_KEY, JSON.stringify(uniqueProducts));
        }
      } else {
        const data = await productsService.getProducts(params);
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      toast.error('Error loading products', { description: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Create product
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        const newProduct = {
          ...productData,
          _id: `product_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          soldCount: 0,
          averageRating: 0,
          totalReviews: 0,
        };

        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        localStorage.setItem(MOCK_PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
        
        toast.success('Product created successfully');
        return newProduct;
      } else {
        const newProduct = await productsService.createProduct(productData);
        await loadProducts();
        toast.success('Product created successfully');
        return newProduct;
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product');
      toast.error('Failed to create product', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products, loadProducts]);

  // Update product
  const updateProduct = useCallback(async (productId, productData) => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        const updatedProducts = products.map(p =>
          p._id === productId
            ? { ...p, ...productData, updatedAt: new Date().toISOString() }
            : p
        );
        setProducts(updatedProducts);
        localStorage.setItem(MOCK_PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
        
        toast.success('Product updated successfully');
        return updatedProducts.find(p => p._id === productId);
      } else {
        const updated = await productsService.updateProduct(productId, productData);
        await loadProducts();
        toast.success('Product updated successfully');
        return updated;
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product');
      toast.error('Failed to update product', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products, loadProducts]);

  // Delete product
  const deleteProduct = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        const updatedProducts = products.filter(p => p._id !== productId);
        setProducts(updatedProducts);
        localStorage.setItem(MOCK_PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
        
        toast.success('Product deleted successfully');
      } else {
        await productsService.deleteProduct(productId);
        await loadProducts();
        toast.success('Product deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
      toast.error('Failed to delete product', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products, loadProducts]);

  // Bulk delete products
  const bulkDeleteProducts = useCallback(async (productIds) => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        const updatedProducts = products.filter(p => !productIds.includes(p._id));
        setProducts(updatedProducts);
        localStorage.setItem(MOCK_PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
        
        toast.success(`${productIds.length} products deleted successfully`);
      } else {
        await productsService.bulkDeleteProducts(productIds);
        await loadProducts();
        toast.success(`${productIds.length} products deleted successfully`);
      }
    } catch (err) {
      console.error('Error deleting products:', err);
      setError(err.message || 'Failed to delete products');
      toast.error('Failed to delete products', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products, loadProducts]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    refreshProducts: loadProducts,
    useMockData: USE_MOCK_DATA,
  };
};
