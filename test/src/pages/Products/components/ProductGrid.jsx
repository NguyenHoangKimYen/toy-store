import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/common/ProductCard';
import { useAddToCart } from '@/hooks';
import { ErrorMessage, Pagination, LoadingSpinner } from '@/components/common';
import { Button } from '@/components/ui/button';

const ProductGrid = ({
  products,
  loading,
  error,
  hasActiveFilters,
  clearFilters,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const { handleAddToCart } = useAddToCart();

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  if (error) {
    return (
      <ErrorMessage
        title="Error loading products"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="products-grid-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="no-products">
        <p className="text-lg text-muted-foreground">No products found</p>
        {hasActiveFilters && (
          <Button variant="link" onClick={clearFilters}>
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="products-grid-container">
      <div className={`products-grid ${loading ? 'loading' : ''}`}>
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant="default"
            showQuickView={false}
            onClick={handleProductClick}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {loading && (
        <div className="products-grid-loading-overlay">
          <LoadingSpinner />
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ProductGrid;
