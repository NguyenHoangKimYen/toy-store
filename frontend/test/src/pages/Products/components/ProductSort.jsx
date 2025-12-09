import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProductSort = ({ sortBy, sortOrder, onSortChange }) => {
  const sortValue = `${sortBy}-${sortOrder}`;

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'rating-asc', label: 'Lowest Rated' },
    { value: 'totalUnitsSold-desc', label: 'Best Selling' },
  ];

  const handleSortChange = (value) => {
    const [newSortBy, newSortOrder] = value.split('-');
    onSortChange(newSortBy, newSortOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select value={sortValue} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select sorting" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductSort;
