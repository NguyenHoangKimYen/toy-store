import React from 'react';
import { Package, Info, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import './ProductTabs.css';

const ProductTabs = ({ product }) => {
  return (
    <div className="product-tabs-section">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">
            <Info size={16} className="mr-2" />
            Description
          </TabsTrigger>
          <TabsTrigger value="specifications">
            <Package size={16} className="mr-2" />
            Specifications
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Shield size={16} className="mr-2" />
            Shipping & Returns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Product Description</h3>
              <div className="product-description">
                {product.description ? (
                  <div className="description-content">
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
              </div>

              {product.features && product.features.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h4 className="font-semibold mb-3">Key Features:</h4>
                  <ul className="features-list">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
              <div className="specifications-grid">
                {product.brand && (
                  <div className="spec-item">
                    <span className="spec-label">Brand</span>
                    <span className="spec-value">{product.brand}</span>
                  </div>
                )}
                {product.categoryId?.[0]?.name && (
                  <div className="spec-item">
                    <span className="spec-label">Category</span>
                    <span className="spec-value">{product.categoryId[0].name}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="spec-item">
                    <span className="spec-label">SKU</span>
                    <span className="spec-value">{product.sku}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="spec-item">
                    <span className="spec-label">Weight</span>
                    <span className="spec-value">{product.weight}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="spec-item">
                    <span className="spec-label">Dimensions</span>
                    <span className="spec-value">{product.dimensions}</span>
                  </div>
                )}
                {product.material && (
                  <div className="spec-item">
                    <span className="spec-label">Material</span>
                    <span className="spec-value">{product.material}</span>
                  </div>
                )}
                {product.color && (
                  <div className="spec-item">
                    <span className="spec-label">Color</span>
                    <span className="spec-value">{product.color}</span>
                  </div>
                )}
              </div>

              {product.variants && product.variants.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h4 className="font-semibold mb-3">Available Variants:</h4>
                  <div className="variants-specs">
                    {product.variants.map((variant) => (
                      <div key={variant._id} className="variant-spec-card">
                        <h5 className="font-medium mb-2">{variant.name}</h5>
                        {variant.attributes && (
                          <div className="variant-attributes">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <div key={key} className="variant-attr-item">
                                <span className="attr-key">{key}:</span>
                                <span className="attr-value">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="variant-stock-info">
                          Stock: {variant.stock} units
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              <div className="shipping-info">
                <div className="info-block">
                  <h4 className="font-medium mb-2">Free Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    Free standard shipping on orders over 1,000,000₫. Estimated delivery time: 5-7 business days.
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="info-block">
                  <h4 className="font-medium mb-2">Express Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    Express shipping available at checkout. Delivery within 2-3 business days.
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="info-block">
                  <h4 className="font-medium mb-2">International Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    We ship worldwide! International delivery times vary by location (7-21 business days).
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">Return Policy</h3>
              <div className="return-info">
                <div className="info-block">
                  <h4 className="font-medium mb-2">30-Day Returns</h4>
                  <p className="text-sm text-muted-foreground">
                    Not satisfied? Return your purchase within 30 days for a full refund.
                    Product must be unused and in original packaging.
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="info-block">
                  <h4 className="font-medium mb-2">Easy Returns Process</h4>
                  <ul className="return-steps">
                    <li>Contact our customer service</li>
                    <li>Receive a return label via email</li>
                    <li>Pack and ship your item</li>
                    <li>Receive your refund within 5-7 business days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductTabs;
