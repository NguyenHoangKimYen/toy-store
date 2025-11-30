import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Package,
  Search,
  Tag,
  DollarSign,
  Layers,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import './ProductFilters.css';

const ProductFilters = ({
  filters = {},
  categories = [],
  brands = [],
  priceRange = { min: 0, max: 500 },
  onFilterChange,
  onClearFilters,
  hasActiveFilters = false,
  isMobile = false,
  onClose,
  productCount = 0,
}) => {
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    brands: true,
    availability: true,
  });

  // Local state for price inputs (to avoid constant URL updates)
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '');

  // Search within categories/brands
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  // Sync local price with filters
  useEffect(() => {
    setLocalMinPrice(filters.minPrice || '');
    setLocalMaxPrice(filters.maxPrice || '');
  }, [filters.minPrice, filters.maxPrice]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Apply price filter
  const handlePriceApply = () => {
    if (localMinPrice !== filters.minPrice) {
      onFilterChange('minPrice', localMinPrice || '');
    }
    if (localMaxPrice !== filters.maxPrice) {
      onFilterChange('maxPrice', localMaxPrice || '');
    }
  };

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter(cat => 
      (cat.name || cat).toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Filter brands by search
  const filteredBrands = useMemo(() => {
    if (!brandSearch) return brands;
    return brands.filter(brand => 
      brand.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brands, brandSearch]);

  // Rating options
  const ratingOptions = [
    { value: '4', label: '4 Stars & Up', stars: 4 },
    { value: '3', label: '3 Stars & Up', stars: 3 },
    { value: '2', label: '2 Stars & Up', stars: 2 },
    { value: '1', label: '1 Star & Up', stars: 1 },
  ];

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.rating) count++;
    if (filters.availability) count++;
    if (filters.showFeatured === 'true') count++;
    return count;
  }, [filters]);

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < count ? 'star-filled' : 'star-empty'}
        fill={i < count ? 'currentColor' : 'none'}
      />
    ));
  };

  const FilterSection = ({ id, title, icon: Icon, children, count }) => (
    <div className={`filter-section ${expandedSections[id] ? 'expanded' : ''}`}>
      <button 
        className="filter-section-header"
        onClick={() => toggleSection(id)}
        aria-expanded={expandedSections[id]}
      >
        <div className="filter-section-title">
          {Icon && <Icon size={16} className="filter-section-icon" />}
          <span>{title}</span>
          {count > 0 && <span className="filter-count">({count})</span>}
        </div>
        {expandedSections[id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expandedSections[id] && (
        <div className="filter-section-content">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className={`product-filters ${isMobile ? 'mobile' : ''}`}>
      {/* Header */}
      <div className="filters-header">
        <div className="filters-header-left">
          <SlidersHorizontal size={18} />
          <h3>Filters</h3>
          {activeFilterCount > 0 && (
            <span className="active-filter-badge">{activeFilterCount}</span>
          )}
        </div>
        <div className="filters-header-right">
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="clear-filters-btn"
            >
              <RotateCcw size={14} />
              Clear All
            </Button>
          )}
          {isMobile && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="close-filters-btn">
              <X size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* Results count on mobile */}
      {isMobile && (
        <div className="filters-result-count">
          <Package size={14} />
          <span>{productCount} products found</span>
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="active-filters-tags">
          {filters.category && (
            <button 
              className="filter-tag"
              onClick={() => onFilterChange('category', '')}
            >
              <span>Category: {categories.find(c => c._id === filters.category)?.name || filters.category}</span>
              <X size={12} />
            </button>
          )}
          {filters.brand && (
            <button 
              className="filter-tag"
              onClick={() => onFilterChange('brand', '')}
            >
              <span>Brand: {filters.brand}</span>
              <X size={12} />
            </button>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <button 
              className="filter-tag"
              onClick={() => { onFilterChange('minPrice', ''); onFilterChange('maxPrice', ''); }}
            >
              <span>
                Price: {filters.minPrice ? `$${filters.minPrice}` : '$0'} - {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
              </span>
              <X size={12} />
            </button>
          )}
          {filters.rating && (
            <button 
              className="filter-tag"
              onClick={() => onFilterChange('rating', '')}
            >
              <span>{filters.rating}★ & Up</span>
              <X size={12} />
            </button>
          )}
          {filters.showFeatured === 'true' && (
            <button 
              className="filter-tag featured"
              onClick={() => onFilterChange('showFeatured', '')}
            >
              <Sparkles size={12} />
              <span>Featured</span>
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Filter Sections */}
      <div className="filters-body">
        {/* Categories Filter */}
        <FilterSection id="categories" title="Categories" icon={Layers} count={categories.length}>
          {categories.length > 6 && (
            <div className="filter-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
            </div>
          )}
          <div className="filter-options categories-list">
            <button
              className={`filter-option ${!filters.category ? 'active' : ''}`}
              onClick={() => onFilterChange('category', '')}
            >
              <span className="option-name">All Categories</span>
              {!filters.category && <Check size={14} className="check-icon" />}
            </button>
            {filteredCategories.map((category) => {
              const id = category._id || category;
              const name = category.name || category;
              return (
                <button
                  key={id}
                  className={`filter-option ${filters.category === id ? 'active' : ''}`}
                  onClick={() => onFilterChange('category', id)}
                >
                  <span className="option-name">{name}</span>
                  {filters.category === id && <Check size={14} className="check-icon" />}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Price Range Filter - MANDATORY */}
        <FilterSection id="price" title="Price Range" icon={DollarSign}>
          <div className="price-filter">
            {/* Price Inputs */}
            <div className="price-inputs">
              <div className="price-input-group">
                <span className="price-input-label">Min</span>
                <div className="price-input-wrapper">
                  <span className="price-currency">$</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    onBlur={handlePriceApply}
                    onKeyDown={(e) => e.key === 'Enter' && handlePriceApply()}
                    min={0}
                    className="price-input"
                  />
                </div>
              </div>
              <span className="price-separator">to</span>
              <div className="price-input-group">
                <span className="price-input-label">Max</span>
                <div className="price-input-wrapper">
                  <span className="price-currency">$</span>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    onBlur={handlePriceApply}
                    onKeyDown={(e) => e.key === 'Enter' && handlePriceApply()}
                    min={0}
                    className="price-input"
                  />
                </div>
              </div>
            </div>

            {/* Apply Price Button */}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handlePriceApply}
              className="apply-price-btn"
            >
              Apply Price
            </Button>

            {/* Quick Price Ranges */}
            <div className="quick-price-ranges">
              <span className="quick-label">Quick select:</span>
              <div className="quick-buttons">
                <button 
                  className={`quick-price-btn ${filters.maxPrice === '25' && !filters.minPrice ? 'active' : ''}`}
                  onClick={() => { onFilterChange('minPrice', ''); onFilterChange('maxPrice', '25'); }}
                >
                  Under $25
                </button>
                <button 
                  className={`quick-price-btn ${filters.minPrice === '25' && filters.maxPrice === '50' ? 'active' : ''}`}
                  onClick={() => { onFilterChange('minPrice', '25'); onFilterChange('maxPrice', '50'); }}
                >
                  $25 - $50
                </button>
                <button 
                  className={`quick-price-btn ${filters.minPrice === '50' && filters.maxPrice === '100' ? 'active' : ''}`}
                  onClick={() => { onFilterChange('minPrice', '50'); onFilterChange('maxPrice', '100'); }}
                >
                  $50 - $100
                </button>
                <button 
                  className={`quick-price-btn ${filters.minPrice === '100' && !filters.maxPrice ? 'active' : ''}`}
                  onClick={() => { onFilterChange('minPrice', '100'); onFilterChange('maxPrice', ''); }}
                >
                  $100+
                </button>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Brands Filter - MANDATORY */}
        <FilterSection id="brands" title="Brands" icon={Tag} count={brands.length}>
          {brands.length > 6 && (
            <div className="filter-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />
            </div>
          )}
          <div className="filter-options brands-list">
            <button
              className={`filter-option ${!filters.brand ? 'active' : ''}`}
              onClick={() => onFilterChange('brand', '')}
            >
              <span className="option-name">All Brands</span>
              {!filters.brand && <Check size={14} className="check-icon" />}
            </button>
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand) => (
                <button
                  key={brand}
                  className={`filter-option ${filters.brand === brand ? 'active' : ''}`}
                  onClick={() => onFilterChange('brand', brand)}
                >
                  <span className="option-name">{brand}</span>
                  {filters.brand === brand && <Check size={14} className="check-icon" />}
                </button>
              ))
            ) : (
              <p className="no-brands-message">No brands available</p>
            )}
          </div>
        </FilterSection>

        {/* Rating Filter */}
        <FilterSection id="rating" title="Customer Rating" icon={Star}>
          <div className="filter-options rating-options">
            <button
              className={`rating-option ${!filters.rating ? 'active' : ''}`}
              onClick={() => onFilterChange('rating', '')}
            >
              <span className="rating-label">All Ratings</span>
              {!filters.rating && <Check size={14} className="check-icon" />}
            </button>
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                className={`rating-option ${filters.rating === option.value ? 'active' : ''}`}
                onClick={() => onFilterChange('rating', filters.rating === option.value ? '' : option.value)}
              >
                <div className="rating-stars">
                  {renderStars(option.stars)}
                </div>
                <span className="rating-label">& Up</span>
                {filters.rating === option.value && <Check size={14} className="check-icon" />}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Availability & Featured Filter */}
        <FilterSection id="availability" title="More Filters" icon={Package}>
          <div className="filter-options checkbox-options">
            <label className="checkbox-option">
              <Checkbox
                checked={filters.availability === 'inStock'}
                onCheckedChange={(checked) => 
                  onFilterChange('availability', checked ? 'inStock' : '')
                }
              />
              <Package size={14} />
              <span>In Stock Only</span>
            </label>
            <label className="checkbox-option featured-checkbox">
              <Checkbox
                checked={filters.showFeatured === 'true'}
                onCheckedChange={(checked) => 
                  onFilterChange('showFeatured', checked ? 'true' : '')
                }
              />
              <Sparkles size={14} className="featured-icon" />
              <span>Featured Products</span>
            </label>
          </div>
        </FilterSection>
      </div>

      {/* Mobile Footer */}
      {isMobile && (
        <div className="filters-footer">
          <Button variant="outline" onClick={onClearFilters} className="footer-btn clear-btn">
            <RotateCcw size={14} />
            Clear All
          </Button>
          <Button onClick={onClose} className="footer-btn apply-btn">
            Show {productCount} Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
