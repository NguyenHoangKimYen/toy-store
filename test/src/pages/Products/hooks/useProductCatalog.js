import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getProductCategories } from '@/services/products.service';

/**
 * Custom hook for managing product catalog state and data fetching
 */
export const useProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const prevQueryRef = useRef(queryString);
  
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

        // Re-parse filters from searchParams to ensure we always use the latest URL state
        const paramsFromUrl = Object.fromEntries(new URLSearchParams(queryString || ''));

        const params = {
          page: currentPage,
          limit,
          sortBy: paramsFromUrl.sortBy || filters.sortBy,
          sortOrder: paramsFromUrl.sortOrder || filters.sortOrder,
        };

        // Add filters if present in URL or derived defaults
        if (paramsFromUrl.search) params.search = paramsFromUrl.search;
        else if (filters.search) params.search = filters.search;

        if (paramsFromUrl.category) params.category = paramsFromUrl.category;
        if (paramsFromUrl.brand) params.brand = paramsFromUrl.brand;
        if (paramsFromUrl.minPrice) params.minPrice = paramsFromUrl.minPrice;
        if (paramsFromUrl.maxPrice) params.maxPrice = paramsFromUrl.maxPrice;
        if (paramsFromUrl.rating) params.rating = paramsFromUrl.rating;

        const response = await getProducts(params);

        const data = response || {};
        // normalize response to always be an array of products
        const productsList = data.products || data || [];

        setProducts(Array.isArray(productsList) ? productsList : []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalProducts(data.pagination?.total || (Array.isArray(productsList) ? productsList.length : 0));
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    // If URL query changed externally, reset page to 1 and wait for state to stabilize
    if (prevQueryRef.current !== queryString) {
      prevQueryRef.current = queryString;
      if (currentPage !== 1) {
        setCurrentPage(1);
        return; // wait for the effect to re-run with currentPage = 1
      }
    }

    fetchProducts();
  }, [currentPage, limit, queryString, filters.search, filters.sortBy, filters.sortOrder]);

  // Fetch metadata (categories and brands)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const categoriesData = await getProductCategories();
        setCategories(categoriesData || []);

        // Fetch all products to extract unique brands
        const allProducts = await getProducts({ limit: 1000 });
        const uniqueBrands = [...new Set(
          (allProducts.products || allProducts || [])
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

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.category || filters.brand || 
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
