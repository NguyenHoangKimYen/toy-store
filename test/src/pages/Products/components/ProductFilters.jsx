import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import './ProductFilters.css';

const ProductFilters = ({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  minPrice,
  maxPrice,
  selectedRating,
  onFilterChange,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
    rating: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="product-filters space-y-6">
      {/* Category Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('category')}
        >
          <h4 className="font-semibold text-sm">Category</h4>
          {expandedSections.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expandedSections.category && (
          <>
            <Separator className="my-3" />
            <RadioGroup
              value={selectedCategory}
              onValueChange={(value) => onFilterChange('category', value)}
            >
              <div className="flex items-center space-x-2 py-1.5">
                <RadioGroupItem value="" id="cat-all" />
                <Label htmlFor="cat-all" className="font-normal cursor-pointer">
                  All Categories
                </Label>
              </div>
              {categories.map((cat) => {
                const id = cat._id || cat;
                const name = cat.name || cat;
                return (
                  <div key={id} className="flex items-center space-x-2 py-1.5">
                    <RadioGroupItem value={id} id={`cat-${id}`} />
                    <Label htmlFor={`cat-${id}`} className="font-normal cursor-pointer">
                      {name}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </>
        )}
      </div>

      <Separator />

      {/* Brand Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('brand')}
        >
          <h4 className="font-semibold text-sm">Brand</h4>
          {expandedSections.brand ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expandedSections.brand && (
          <>
            <Separator className="my-3" />
            <RadioGroup
              value={selectedBrand}
              onValueChange={(value) => onFilterChange('brand', value)}
            >
              <div className="flex items-center space-x-2 py-1.5">
                <RadioGroupItem value="" id="brand-all" />
                <Label htmlFor="brand-all" className="font-normal cursor-pointer">
                  All Brands
                </Label>
              </div>
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2 py-1.5">
                  <RadioGroupItem value={brand} id={`brand-${brand}`} />
                  <Label htmlFor={`brand-${brand}`} className="font-normal cursor-pointer">
                    {brand}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </>
        )}
      </div>

      <Separator />

      {/* Price Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('price')}
        >
          <h4 className="font-semibold text-sm">Price Range</h4>
          {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expandedSections.price && (
          <>
            <Separator className="my-3" />
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="minPrice" className="text-xs">Minimum (VND)</Label>
                <Input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  placeholder="0"
                  value={minPrice}
                  onChange={handlePriceChange}
                  min="0"
                  step="10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice" className="text-xs">Maximum (VND)</Label>
                <Input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  placeholder="10000000"
                  value={maxPrice}
                  onChange={handlePriceChange}
                  min="0"
                  step="10000"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Rating Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('rating')}
        >
          <h4 className="font-semibold text-sm">Rating</h4>
          {expandedSections.rating ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expandedSections.rating && (
          <>
            <Separator className="my-3" />
            <RadioGroup
              value={selectedRating}
              onValueChange={(value) => onFilterChange('rating', value)}
            >
              <div className="flex items-center space-x-2 py-1.5">
                <RadioGroupItem value="" id="rating-all" />
                <Label htmlFor="rating-all" className="font-normal cursor-pointer">
                  All Ratings
                </Label>
              </div>
              {ratings.map((rating) => (
                <div key={rating} className="flex items-center space-x-2 py-1.5">
                  <RadioGroupItem value={String(rating)} id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="font-normal cursor-pointer flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rating ? '#fbbf24' : 'none'}
                          stroke={i < rating ? '#fbbf24' : '#d1d5db'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">& Up</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
