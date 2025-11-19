import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as categoriesService from '@/services/categories.service';

/**
 * Hook for category management
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all categories
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading categories:', err);
      console.error('Full error details:', {
        message: err.message,
        stack: err.stack,
      });
      setError(err.message || 'Failed to load categories');
      // Don't show toast on initial load, just log the error
      // Categories are optional, so we can continue without them
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Create category
  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if category with similar name already exists
      const normalizedName = categoryData.name.toLowerCase().trim();
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase().trim() === normalizedName
      );
      
      if (existingCategory) {
        setLoading(false);
        toast.success('Category already exists', { 
          description: `Using existing category "${existingCategory.name}"`,
          duration: 3000,
        });
        // Return the existing category instead of creating a new one
        return existingCategory;
      }
      
      // Generate slug from name if not provided
      const slug = categoryData.slug || 
        categoryData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      
      const newCategory = await categoriesService.createCategory({
        ...categoryData,
        slug,
      });
      
      await loadCategories();
      toast.success('Category created successfully');
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err.message || 'Failed to create category');
      if (!err.message.includes('already exists')) {
        toast.error('Failed to create category', { description: err.message });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categories, loadCategories]);

  // Update category
  const updateCategory = useCallback(async (categoryId, categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updated = await categoriesService.updateCategory(categoryId, categoryData);
      await loadCategories();
      toast.success('Category updated successfully');
      return updated;
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category');
      toast.error('Failed to update category', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCategories]);

  // Delete category
  const deleteCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      
      await categoriesService.deleteCategory(categoryId);
      await loadCategories();
      toast.success('Category deleted successfully');
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
      toast.error('Failed to delete category', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: loadCategories,
  };
};
