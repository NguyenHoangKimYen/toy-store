import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdvancedSearchBar } from '@/components/common';
import ProductSort from './ProductSort';

const ProductToolbar = ({
  showFilters,
  setShowFilters,
  hasActiveFilters,
  clearFilters,
  totalProducts,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  return (
    <div className="products-toolbar">
      {/* Advanced Search Bar - Full Width */}
      <div className="toolbar-search">
        <AdvancedSearchBar placeholder="Search for products..." />
      </div>

      {/* Controls Row */}
      <div className="toolbar-controls">
        {/* Left Side - Filters and Count */}
        <div className="toolbar-left">
          <div className="toolbar-filters">
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal size={18} />
              <span className="filter-text">Filters</span>
              {hasActiveFilters && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full" />
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1 clear-btn"
              >
                <X size={16} />
                <span className="clear-text">Clear</span>
              </Button>
            )}
          </div>

          <Separator orientation="vertical" className="toolbar-separator" />

          <span className="products-count">
            <span className="count-number">{totalProducts}</span>
            <span className="count-label">{totalProducts === 1 ? 'Product' : 'Products'}</span>
          </span>
        </div>

        {/* Right Side - Sort */}
        <div className="toolbar-right">
          <ProductSort
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductToolbar;
