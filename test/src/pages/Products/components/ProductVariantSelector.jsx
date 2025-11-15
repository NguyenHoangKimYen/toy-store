import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils/formatPrice';

const ProductVariantSelector = ({ variants, selectedVariant, onVariantChange }) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="product-variants">
      <h3 className="variants-title">Select Variant</h3>
      <RadioGroup
        value={selectedVariant?._id}
        onValueChange={onVariantChange}
      >
        <div className="variants-grid">
          {variants.map((variant) => (
            <div
              key={variant._id}
              className={`variant-option ${selectedVariant?._id === variant._id ? 'selected' : ''}`}
            >
              <RadioGroupItem value={variant._id} id={variant._id} className="sr-only" />
              <Label htmlFor={variant._id} className="variant-label">
                <div className="variant-info">
                  <span className="variant-name">{variant.name}</span>
                  {variant.attributes && Object.entries(variant.attributes).map(([key, value]) => (
                    <span key={key} className="variant-attr">
                      {key}: {value}
                    </span>
                  ))}
                </div>
                <div className="variant-price">
                  {formatPrice(variant.price)}
                </div>
                {variant.stock <= 0 && (
                  <Badge variant="destructive" className="variant-stock">Out</Badge>
                )}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default ProductVariantSelector;
