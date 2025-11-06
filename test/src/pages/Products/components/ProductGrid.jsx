import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/common/ProductCard';
import { ErrorMessage } from '@/components/common';
import { Button } from '@/components/ui/button';
import Pagination from './Pagination';

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
    <>
      <div className="products-grid">
        {products.map((product) => (
          <div
            key={product._id}
            onClick={() => handleProductClick(product)}
            style={{ cursor: 'pointer' }}
          >
            <ProductCard
              product={product}
              variant="default"
              showQuickView={false}
            />
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}
    </>
  );
};

export default ProductGrid;
