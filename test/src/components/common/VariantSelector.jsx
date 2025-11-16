import React, { useState, useEffect } from 'react';
import { formatPrice } from '@/utils/formatPrice';
import './VariantSelector.css';

/**
 * VariantSelector Component
 * Displays attribute options for product variants and allows user to select
 * Shows price, stock, and SKU for selected variant
 * 
 * @param {Array} variants - Array of variant objects for the product
 * @param {Array} attributes - Array of attribute definitions from product (name, values)
 * @param {Function} onVariantChange - Callback when variant is selected
 * @param {Object} selectedVariant - Currently selected variant (optional)
 */
const VariantSelector = ({ 
  variants = [], 
  attributes = [], 
  onVariantChange,
  selectedVariant: controlledVariant
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Initialize with first variant or controlled variant
  useEffect(() => {
    if (controlledVariant) {
      setSelectedVariant(controlledVariant);
      // Extract attributes from controlled variant
      const attrs = {};
      controlledVariant.attributes?.forEach(attr => {
        attrs[attr.name] = attr.value;
      });
      setSelectedAttributes(attrs);
    } else if (variants.length > 0) {
      // Select first available variant
      const firstVariant = variants[0];
      setSelectedVariant(firstVariant);
      const attrs = {};
      firstVariant.attributes?.forEach(attr => {
        attrs[attr.name] = attr.value;
      });
      setSelectedAttributes(attrs);
      onVariantChange?.(firstVariant);
    }
  }, [controlledVariant, variants, onVariantChange]);

  // Find variant matching selected attributes
  const findMatchingVariant = (attrs) => {
    return variants.find(variant => {
      if (!variant.attributes) return false;
      
      // Check if all selected attributes match
      return Object.entries(attrs).every(([name, value]) => {
        const variantAttr = variant.attributes.find(a => a.name === name);
        return variantAttr && variantAttr.value === value;
      });
    });
  };

  // Handle attribute selection
  const handleAttributeSelect = (attributeName, value) => {
    const newAttrs = {
      ...selectedAttributes,
      [attributeName]: value
    };
    setSelectedAttributes(newAttrs);

    // Find matching variant
    const matchingVariant = findMatchingVariant(newAttrs);
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      onVariantChange?.(matchingVariant);
    }
  };

  // Check if an attribute value is available (has stock)
  const isValueAvailable = (attributeName, value) => {
    // Create temporary attributes with this value
    const tempAttrs = {
      ...selectedAttributes,
      [attributeName]: value
    };
    
    const variant = findMatchingVariant(tempAttrs);
    return variant && variant.stockQuantity > 0 && variant.isActive;
  };

  if (!variants.length || !attributes.length) {
    return null;
  }

  const price = selectedVariant?.price?.$numberDecimal || selectedVariant?.price;
  const stock = selectedVariant?.stockQuantity || 0;
  const sku = selectedVariant?.sku || '';
  const isInStock = stock > 0 && selectedVariant?.isActive;

  return (
    <div className="variant-selector">
      {/* Attribute Selection */}
      {attributes.map(attribute => (
        <div key={attribute.name} className="attribute-group">
          <label className="attribute-label">{attribute.name}</label>
          <div className="attribute-options">
            {attribute.values.map(value => {
              const isSelected = selectedAttributes[attribute.name] === value;
              const isAvailable = isValueAvailable(attribute.name, value);
              
              return (
                <button
                  key={value}
                  className={`attribute-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                  onClick={() => handleAttributeSelect(attribute.name, value)}
                  disabled={!isAvailable}
                  aria-label={`Select ${attribute.name}: ${value}`}
                >
                  {value}
                  {!isAvailable && (
                    <span className="out-of-stock-indicator">✕</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="variant-info">
          <div className="variant-price">
            <span className="price-label">Price:</span>
            <span className="price-value">{formatPrice(price)}</span>
          </div>
          
          <div className="variant-stock">
            <span className="stock-label">Availability:</span>
            <span className={`stock-value ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
              {isInStock ? `${stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {sku && (
            <div className="variant-sku">
              <span className="sku-label">SKU:</span>
              <span className="sku-value">{sku}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
