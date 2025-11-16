import React, { useState, useEffect } from 'react';
import './VariantSelector.css';

/**
 * VariantSelector Component - Shopee Style
 * Displays attribute options for product variants and allows user to select
 * Updates product image and price when variant changes
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

  console.log('VariantSelector render:', { variants, attributes, controlledVariant });

  // Initialize with first variant or controlled variant
  useEffect(() => {
    if (controlledVariant) {
      // Extract attributes from controlled variant
      const attrs = {};
      controlledVariant.attributes?.forEach(attr => {
        attrs[attr.name] = attr.value;
      });
      setSelectedAttributes(attrs);
    } else if (variants.length > 0) {
      // Select first available variant
      const firstVariant = variants[0];
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

  return (
    <div className="variant-selector">
      {/* Attribute Selection - Shopee Style */}
      {attributes.map(attribute => (
        <div key={attribute.name} className="attribute-group">
          <label className="attribute-label">
            {attribute.name}: <span className="selected-value">{selectedAttributes[attribute.name]}</span>
          </label>
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
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VariantSelector;
