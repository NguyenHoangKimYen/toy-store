import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import './ProductTabs.css';

const ProductTabs = ({ product }) => {
  const formatDateAdded = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="product-details-section">
      <Card>
        <CardContent className="pt-6">
          {/* Product Specifications */}
          <div className="section-block">
            <h3 className="section-title">Product Specifications</h3>
            <div className="specs-list">
              {product.categoryId?.[0]?.name && (
                <div className="spec-row">
                  <span className="spec-label">Category</span>
                  <span className="spec-value">{product.categoryId[0].name}</span>
                </div>
              )}
              {product.brand && (
                <div className="spec-row">
                  <span className="spec-label">Brand</span>
                  <span className="spec-value">{product.brand}</span>
                </div>
              )}
              <div className="spec-row">
                <span className="spec-label">Total Sold</span>
                <span className="spec-value">{product.totalUnitsSold || 0}</span>
              </div>
              {product.createdAt && (
                <div className="spec-row">
                  <span className="spec-label">Date Added</span>
                  <span className="spec-value">{formatDateAdded(product.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Product Description */}
          <div className="section-block">
            <h3 className="section-title">Product Description</h3>
            <div className="description-content">
              {product.description ? (
                <div>
                  {product.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {product.shortDescription || 'No description available.'}
                </p>
              )}

              {product.features && product.features.length > 0 && (
                <>
                  <h4 className="features-subtitle">Key Features:</h4>
                  <ul className="features-list">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductTabs;
