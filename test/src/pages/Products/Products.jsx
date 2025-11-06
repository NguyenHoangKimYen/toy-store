import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { getProducts, getProductCategories } from '@/services/products.service';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import ProductCard from '@/components/common/ProductCard';
import ProductFilters from './components/ProductFilters';
import ProductSort from './components/ProductSort';
import Pagination from './components/Pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(12); // Products per page

  // Get filters from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: currentPage,
          limit,
          sortBy,
          sortOrder,
        };

        // Add filters if present
        if (search) params.search = search;
        if (category) params.category = category;
        if (brand) params.brand = brand;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (rating) params.rating = rating;

        const response = await getProducts(params);
        
        setProducts(response.products || response || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalProducts(response.pagination?.total || response.length || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, limit, search, category, brand, minPrice, maxPrice, rating, sortBy, sortOrder]);

  // Fetch categories and brands
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

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(filterName, value);
    } else {
      newParams.delete(filterName);
    }
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  // Handle sort change
  const handleSortChange = (newSortBy, newSortOrder) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', newSortBy);
    newParams.set('sortOrder', newSortOrder);
    setSearchParams(newParams);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  // Handle product click
  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  // Check if any filters are active
  const hasActiveFilters = search || category || brand || minPrice || maxPrice || rating;

  if (loading && currentPage === 1) {
    return (
      <div className="products-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-container">
        {/* Header */}
        <div className="products-header">
          <div className="products-header-content">
            <h1 className="products-title">Our Products</h1>
            <p className="products-subtitle">
              Discover our collection of {totalProducts} amazing products
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="products-toolbar">
          <div className="toolbar-left">
            <button
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
              {hasActiveFilters && <span className="filter-badge"></span>}
            </button>

            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <X size={16} />
                Clear Filters
              </button>
            )}

            <span className="products-count">
              {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
            </span>
          </div>

          <div className="toolbar-right">
            <ProductSort
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />

            <div className="view-mode-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid size={20} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="products-content">
          {/* Filters Sidebar */}
          <aside className={`products-filters ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button
                className="close-filters-btn"
                onClick={() => setShowFilters(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <ProductFilters
              categories={categories}
              brands={brands}
              selectedCategory={category}
              selectedBrand={brand}
              minPrice={minPrice}
              maxPrice={maxPrice}
              selectedRating={rating}
              onFilterChange={handleFilterChange}
            />
          </aside>

          {/* Products Grid/List */}
          <main className="products-main">
            {error ? (
              <ErrorMessage
                title="Error loading products"
                message={error}
                onRetry={() => window.location.reload()}
              />
            ) : products.length === 0 ? (
              <div className="no-products">
                <p>No products found</p>
                {hasActiveFilters && (
                  <button className="clear-filters-link" onClick={clearFilters}>
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`products-${viewMode}`}>
                  {products.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <ProductCard
                        product={product}
                        variant={viewMode === 'list' ? 'horizontal' : 'default'}
                        showQuickView={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}

            {loading && currentPage > 1 && (
              <div className="loading-overlay">
                <LoadingSpinner />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
