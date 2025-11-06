import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ProductFilters from './ProductFilters';

const ProductFilterSidebar = ({
  showFilters,
  setShowFilters,
  categories,
  brands,
  filters,
  onFilterChange,
}) => {
  return (
    <aside className={`products-filters ${showFilters ? 'show' : ''}`}>
      <div className="filters-header">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowFilters(false)}
          aria-label="Close filters"
        >
          <X size={20} />
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      <ProductFilters
        categories={categories}
        brands={brands}
        selectedCategory={filters.category}
        selectedBrand={filters.brand}
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        selectedRating={filters.rating}
        onFilterChange={onFilterChange}
      />
    </aside>
  );
};

export default ProductFilterSidebar;
