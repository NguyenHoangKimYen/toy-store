import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useProductDetail } from '@/hooks';
import { addToCart } from '@/services/cart.service';
import { ROUTES } from '@/config/routes';
import ProductImageGallery from './components/ProductImageGallery';
import ProductInfo from './components/ProductInfo';
import ProductVariantSelector from './components/ProductVariantSelector';
import ProductActions from './components/ProductActions';
import ProductTabs from './components/ProductTabs';
import ReviewSection from './components/ReviewSection';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    product,
    loading,
    error,
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
    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
      
      // Show success message
      toast.success(`${product.name} added to cart!`, {
        description: `Quantity: ${quantity}`,
      });
      
      // Dispatch custom event to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart', {
        description: 'Please try again.',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
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
              images={product.imageUrls || []} 
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
            />

            {/* Variants */}
            <ProductVariantSelector
              variants={product.variants}
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
              loading={addingToCart}
            />
          </div>
        </div>

        {/* Product Details Tabs */}
        <ProductTabs product={product} />

        {/* Reviews Section */}
        <ReviewSection productId={id} />
      </div>
    </div>
  );
};

export default ProductDetail;
