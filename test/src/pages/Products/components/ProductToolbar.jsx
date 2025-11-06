import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ProductSort from '../ProductSort';
import ProductViewToggle from './ProductViewToggle';

const ProductToolbar = ({
  showFilters,
  setShowFilters,
  hasActiveFilters,
  clearFilters,
  totalProducts,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="products-toolbar">
      <div className="toolbar-left">
        <Button
          variant="outline"
          size="default"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal size={20} />
          <span>Filters</span>
          {hasActiveFilters && (
            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full" />
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1"
          >
            <X size={16} />
            Clear Filters
          </Button>
        )}

        <Separator orientation="vertical" className="h-8 mx-2" />

        <span className="products-count text-sm text-muted-foreground">
          {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
        </span>
      </div>

      <div className="toolbar-right">
        <ProductSort
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />

        <Separator orientation="vertical" className="h-8 mx-2" />

        <ProductViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
    </div>
  );
};

export default ProductToolbar;
