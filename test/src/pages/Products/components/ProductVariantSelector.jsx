import React from 'react';
import { VariantSelector } from '@/components/common';

/**
 * Product page wrapper for VariantSelector component
 * Adapts product data structure for the generic VariantSelector
 */
const ProductVariantSelector = ({ product, variants, selectedVariant, onVariantChange }) => {
  console.log('ProductVariantSelector:', { product, variants, selectedVariant });
  
  if (!variants || variants.length === 0) {
    console.log('No variants to display');
    return null;
  }

  // Get attributes definition from product
  const attributes = product?.attributes || [];
  
  if (attributes.length === 0) {
    console.warn('Product has no attributes defined');
    return null;
  }

  return (
    <div className="product-variants-wrapper">
      <VariantSelector
        variants={variants}
        attributes={attributes}
        selectedVariant={selectedVariant}
        onVariantChange={onVariantChange}
      />
    </div>
  );
};

export default ProductVariantSelector;
