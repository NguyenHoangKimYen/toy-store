import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getProductCategories } from '@/services/products.service';

/**
 * Custom hook for managing product catalog state and data fetching
 */
export const useProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 12;

  // Get filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: currentPage,
          limit,
        };

        // Add sort parameter (backend expects "field:order" format)
        if (filters.sortBy && filters.sortOrder) {
          params.sort = `${filters.sortBy}:${filters.sortOrder}`;
        }

        // Add filters if present (using correct backend parameter names)
        if (filters.search) params.keyword = filters.search;
        if (filters.category) params.categoryId = filters.category;
        // Brand filtering not supported by backend yet
        // if (filters.brand) params.brand = filters.brand;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.rating) params.minRating = filters.rating;

        const response = await getProducts(params);
        
        // Backend returns { products: [...], pagination: { totalProducts, totalPages, currentPage, limit } }
        setProducts(response.products || response || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalProducts(response.pagination?.totalProducts || response.pagination?.total || response.length || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, limit, filters.search, filters.category, 
      filters.minPrice, filters.maxPrice, filters.rating, filters.sortBy, filters.sortOrder]);

  // Fetch metadata (categories and brands)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const categoriesData = await getProductCategories();
        setCategories(categoriesData || []);

        // Fetch all products to extract unique brands
        // Note: Backend doesn't have brand field yet, so brands will be empty
        const allProducts = await getProducts({ status: 'all', limit: 1000 });
        const productsArray = allProducts.products || allProducts || [];
        const uniqueBrands = [...new Set(
          productsArray
            .map(p => p.brand)
            .filter(Boolean)
        )];
        setBrands(uniqueBrands);
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };

    fetchMetadata();
  }, []);

  // Update filter in URL
  const handleFilterChange = (filterName, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(filterName, value);
    } else {
      newParams.delete(filterName);
    }
    
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  // Update sort
  const handleSortChange = (newSortBy, newSortOrder) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', newSortBy);
    newParams.set('sortOrder', newSortOrder);
    setSearchParams(newParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  // Check if any filters are active (exclude brand since not supported)
  const hasActiveFilters = filters.search || filters.category || 
                          filters.minPrice || filters.maxPrice || filters.rating;

  return {
    products,
    categories,
    brands,
    loading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    filters,
    hasActiveFilters,
    setCurrentPage,
    handleFilterChange,
    handleSortChange,
    clearFilters,
  };
};
