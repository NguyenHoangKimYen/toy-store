import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  SlidersHorizontal,
  RotateCcw,
  Package,
  Search,
  Tag,
  DollarSign,
  Layers,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import './ProductFilters.css';

const ProductFilters = ({
  filters = {},
  categories = [],
  onFilterChange,
  onMultipleFiltersChange,
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
  });

  // Refs for price inputs (uncontrolled)
  const minPriceRef = useRef(null);
  const maxPriceRef = useRef(null);

  // Local filter state (excluding price - use refs for those)
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || '',
    rating: filters.rating || '',
  });

  // Apply all filters at once
  const applyFilters = () => {
    onMultipleFiltersChange({
      ...localFilters,
      minPrice: minPriceRef.current?.value || '',
      maxPrice: maxPriceRef.current?.value || '',
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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

      {/* Apply Filters Button */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
        <Button 
          onClick={applyFilters}
          className="w-full"
          size="default"
        >
          Apply Filters
        </Button>
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
          {(filters.minPrice || filters.maxPrice) && (
            <button 
              className="filter-tag"
              onClick={() => { onFilterChange('minPrice', ''); onFilterChange('maxPrice', ''); }}
            >
              <span>
                Price: {filters.minPrice ? `₫${filters.minPrice}` : '₫0'} - {filters.maxPrice ? `₫${filters.maxPrice}` : 'Any'}
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
        </div>
      )}

      {/* Filter Sections */}
      <div className="filters-body">
        {/* Categories Filter */}
        <FilterSection id="categories" title="Categories" icon={Layers} count={categories.length}>
          <div className="filter-options categories-list">
            <button
              className={`filter-option ${!localFilters.category ? 'active' : ''}`}
              onClick={() => setLocalFilters(prev => ({ ...prev, category: '' }))}
            >
              <span className="option-name">All Categories</span>
              {!localFilters.category && <Check size={14} className="check-icon" />}
            </button>
            {categories.map((category) => {
              const id = category._id || category;
              const name = category.name || category;
              return (
                <button
                  key={id}
                  className={`filter-option ${localFilters.category === id ? 'active' : ''}`}
                  onClick={() => setLocalFilters(prev => ({ ...prev, category: id }))}
                >
                  <span className="option-name">{name}</span>
                  {localFilters.category === id && <Check size={14} className="check-icon" />}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Price Range Filter - MANDATORY */}
        <FilterSection id="price" title="Price Range" icon={DollarSign}>
          <div className="price-filter">
            {/* Price Inputs - Stacked Layout */}
            <div className="price-inputs" style={{ flexDirection: 'column', gap: '0.75rem' }}>
              <div className="price-input-group" style={{ width: '100%' }}>
                <span className="price-input-label">Min</span>
                <div className="price-input-wrapper" style={{ flex: 1 }}>
                  <span className="price-currency">₫</span>
                  <input
                    ref={minPriceRef}
                    type="number"
                    placeholder="0"
                    defaultValue={filters.minPrice || ''}
                    min={0}
                    className="price-input"
                    style={{ 
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
              <div className="price-input-group" style={{ width: '100%' }}>
                <span className="price-input-label">Max</span>
                <div className="price-input-wrapper" style={{ flex: 1 }}>
                  <span className="price-currency">₫</span>
                  <input
                    ref={maxPriceRef}
                    type="number"
                    placeholder="Any"
                    defaultValue={filters.maxPrice || ''}
                    min={0}
                    className="price-input"
                    style={{ 
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Price Ranges */}
            <div className="quick-price-ranges">
              <span className="quick-label">Quick select:</span>
              <div className="quick-buttons">
                <button 
                  className="quick-price-btn"
                  onClick={() => {
                    if (minPriceRef.current) minPriceRef.current.value = '';
                    if (maxPriceRef.current) maxPriceRef.current.value = '50000';
                  }}
                >
                  Under ₫50.000
                </button>
                <button 
                  className="quick-price-btn"
                  onClick={() => {
                    if (minPriceRef.current) minPriceRef.current.value = '50000';
                    if (maxPriceRef.current) maxPriceRef.current.value = '150000';
                  }}
                >
                  ₫50.000 - ₫150.000
                </button>
                <button 
                  className="quick-price-btn"
                  onClick={() => {
                    if (minPriceRef.current) minPriceRef.current.value = '150000';
                    if (maxPriceRef.current) maxPriceRef.current.value = '300000';
                  }}
                >
                  ₫150.000 - ₫300.000
                </button>
                <button 
                  className="quick-price-btn"
                  onClick={() => {
                    if (minPriceRef.current) minPriceRef.current.value = '300000';
                    if (maxPriceRef.current) maxPriceRef.current.value = '';
                  }}
                >
                  Above ₫300.000
                </button>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Rating Filter */}
        <FilterSection id="rating" title="Customer Rating" icon={Star}>
          <div className="filter-options rating-options">
            <button
              className={`rating-option ${!localFilters.rating ? 'active' : ''}`}
              onClick={() => setLocalFilters(prev => ({ ...prev, rating: '' }))}
            >
              <span className="rating-label">All Ratings</span>
              {!localFilters.rating && <Check size={14} className="check-icon" />}
            </button>
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                className={`rating-option ${localFilters.rating === option.value ? 'active' : ''}`}
                onClick={() => setLocalFilters(prev => ({ ...prev, rating: prev.rating === option.value ? '' : option.value }))}
              >
                <div className="rating-stars">
                  {renderStars(option.stars)}
                </div>
                <span className="rating-label">& Up</span>
                {localFilters.rating === option.value && <Check size={14} className="check-icon" />}
              </button>
            ))}
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

ProductFilters.displayName = 'ProductFilters';

export default ProductFilters;
