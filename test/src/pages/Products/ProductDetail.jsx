import React, { lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useProductDetail, useCart } from '@/hooks';
import { ROUTES } from '@/config/routes';
import './ProductDetail.css';

// Lazy load below-the-fold components
const ProductImageGallery = lazy(() => import('./components/ProductImageGallery'));
const ProductInfo = lazy(() => import('./components/ProductInfo'));
const ProductVariantSelector = lazy(() => import('./components/ProductVariantSelector'));
const ProductActions = lazy(() => import('./components/ProductActions'));
const ProductTabs = lazy(() => import('./components/ProductTabs'));
const ReviewSection = lazy(() => import('./components/ReviewSection'));

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const {
    product,
    loading,
    error,
    variants,
    selectedVariant,
    quantity,
    price,
    originalPrice,
    stock,
    inStock,
    discount,
    handleQuantityChange,
    handleVariantChange,
  } = useProductDetail(id);

  const [isFavorite, setIsFavorite] = React.useState(false);
  const [addingToCart, setAddingToCart] = React.useState(false);

  const handleAddToCart = async () => {
    const startTime = performance.now();
    
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    if (!inStock) {
      toast.error('This variant is out of stock');
      return;
    }

    try {
      setAddingToCart(true);
      
      // Show loading toast immediately
      const variantInfo = selectedVariant.attributes
        ?.map(attr => `${attr.name}: ${attr.value}`)
        .join(', ');
      
      const toastId = toast.loading(`Adding ${product.name} to cart...`, {
        description: `${variantInfo} • Quantity: ${quantity}`,
      });
      
      console.log('[PRODUCT DETAIL] Adding to cart...', { 
        productId: product._id, 
        variantId: selectedVariant._id,
        quantity 
      });
      
      const apiStartTime = performance.now();
      
      // Add to cart and update toast based on result
      addItem(product._id, quantity, selectedVariant._id)
        .then(() => {
          console.log('[PRODUCT DETAIL] Background API call completed in', (performance.now() - apiStartTime).toFixed(0), 'ms');
          toast.success(`${product.name} added to cart!`, {
            id: toastId,
            description: `${variantInfo} • Quantity: ${quantity}`,
          });
        })
        .catch(err => {
          console.error('[PRODUCT DETAIL] Background API failed:', err);
          toast.error('Failed to add to cart', {
            id: toastId,
            description: err.message || 'Please try again.',
          });
        })
        .finally(() => {
          setAddingToCart(false);
        });
      
      console.log('[PRODUCT DETAIL] Toast shown in:', (performance.now() - startTime).toFixed(0), 'ms');
    } catch (err) {
      console.error('[PRODUCT DETAIL] Error after', (performance.now() - startTime).toFixed(0), 'ms:', err);
      toast.error('Failed to add to cart', {
        description: 'Please try again.',
      });
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    if (!inStock) {
      toast.error('This variant is out of stock');
      return;
    }

    try {
      setAddingToCart(true);
      await addItem(product._id, quantity, selectedVariant._id);
      navigate(ROUTES.CHECKOUT);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart', {
        description: 'Please try again.',
      });
      setAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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
            <ProductImageGallery 
              images={selectedVariant?.imageUrls || product.imageUrls || []} 
              productName={product.name} 
            />
          </div>

          {/* Product Info */}
          <div>
            <ProductInfo
              product={product}
              rating={product.rating || 0}
              reviewCount={product.reviewCount || 0}
              price={price}
              originalPrice={originalPrice}
              inStock={inStock}
              stock={stock}
              discount={discount}
              selectedVariant={selectedVariant}
            />

            {/* Variants */}
            <ProductVariantSelector
              product={product}
              variants={variants}
              selectedVariant={selectedVariant}
              onVariantChange={handleVariantChange}
            />

            {/* Actions */}
            <ProductActions
              inStock={inStock}
              quantity={quantity}
              stock={stock}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              isFavorite={isFavorite}
              onToggleFavorite={() => setIsFavorite(!isFavorite)}
              onShare={handleShare}
              selectedVariant={selectedVariant}
              loading={addingToCart}
            />
          </div>
        </div>

        {/* Product Details Tabs */}
        <ProductTabs product={product} />

        {/* Reviews Section */}
        <ReviewSection productId={id} />
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="mobile-action-bar">
        <div className="mobile-action-buttons">
          <button
            className="mobile-cart-btn"
            onClick={handleAddToCart}
            disabled={!selectedVariant || !inStock || addingToCart}
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
          <button
            className="mobile-buy-btn"
            onClick={handleBuyNow}
            disabled={!selectedVariant || !inStock || addingToCart}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
