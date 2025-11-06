import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Heart, Star, Minus, Plus, Share2, Check } from 'lucide-react';
import { getProductById } from '@/services/products.service';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ProductImageGallery from './components/ProductImageGallery';
import ProductReviews from './components/ProductReviews';
import ProductTabs from './components/ProductTabs';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        setProduct(data);
        
        // Set default variant if available
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    const maxStock = selectedVariant?.stock || product?.stockQuantity || 0;
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', {
      product,
      variant: selectedVariant,
      quantity,
    });
  };

  const handleBuyNow = () => {
    // TODO: Implement buy now functionality
    console.log('Buy now:', {
      product,
      variant: selectedVariant,
      quantity,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-error">
        <ErrorMessage
          title="Product not found"
          message={error || 'The product you are looking for does not exist'}
          onRetry={() => navigate('/products')}
          retryText="Back to Products"
        />
      </div>
    );
  }

  const price = selectedVariant?.price || product.price?.$numberDecimal || product.price;
  const originalPrice = selectedVariant?.originalPrice || product.originalPrice?.$numberDecimal || product.originalPrice;
  const stock = selectedVariant?.stock || product.stockQuantity || 0;
  const inStock = stock > 0;
  const discount = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="back-button mb-6"
        >
          <ChevronLeft size={20} />
          Back to Products
        </Button>

        {/* Product Main Section */}
        <div className="product-main-section">
          {/* Image Gallery */}
          <div className="product-gallery-section">
            <ProductImageGallery images={product.imageUrls || []} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            {/* Badges */}
            <div className="product-badges">
              {product.isNew && <Badge variant="default">New</Badge>}
              {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
              {product.isBestSeller && <Badge variant="outline">Best Seller</Badge>}
              {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
            </div>

            {/* Title & Brand */}
            <h1 className="product-title">{product.name}</h1>
            {product.brand && (
              <p className="product-brand">by <span>{product.brand}</span></p>
            )}

            {/* Rating */}
            <div className="product-rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < Math.floor(product.rating || 0) ? '#fbbf24' : 'none'}
                    stroke={i < Math.floor(product.rating || 0) ? '#fbbf24' : '#d1d5db'}
                  />
                ))}
              </div>
              <span className="rating-text">
                {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)
              </span>
            </div>

            <Separator className="my-4" />

            {/* Price */}
            <div className="product-pricing">
              <div className="price-main">
                <span className="current-price">${Number(price).toLocaleString()}</span>
                {originalPrice && originalPrice > price && (
                  <span className="original-price">${Number(originalPrice).toLocaleString()}</span>
                )}
              </div>
              {inStock ? (
                <Badge variant="outline" className="stock-badge in-stock">
                  <Check size={14} className="mr-1" />
                  In Stock ({stock} available)
                </Badge>
              ) : (
                <Badge variant="destructive" className="stock-badge">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="product-short-description">{product.shortDescription}</p>
            )}

            <Separator className="my-4" />

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="product-variants">
                <h3 className="variants-title">Select Variant</h3>
                <RadioGroup
                  value={selectedVariant?._id}
                  onValueChange={(value) => {
                    const variant = product.variants.find(v => v._id === value);
                    setSelectedVariant(variant);
                    setQuantity(1);
                  }}
                >
                  <div className="variants-grid">
                    {product.variants.map((variant) => (
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
                            ${Number(variant.price).toLocaleString()}
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
            )}

            {/* Quantity Selector */}
            {inStock && (
              <div className="quantity-selector">
                <h3 className="quantity-title">Quantity</h3>
                <div className="quantity-controls">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="quantity-value">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= stock}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="add-to-cart-btn flex-1"
              >
                <ShoppingCart size={20} className="mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="default"
                onClick={handleBuyNow}
                disabled={!inStock}
                className="buy-now-btn flex-1"
              >
                Buy Now
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="secondary-actions">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex-1"
              >
                <Heart size={20} className={`mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="flex-1"
              >
                <Share2 size={20} className="mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <ProductTabs product={product} />

        {/* Reviews Section */}
        <ProductReviews productId={id} rating={product.rating} reviewCount={product.reviewCount} />
      </div>
    </div>
  );
};

export default ProductDetail;
