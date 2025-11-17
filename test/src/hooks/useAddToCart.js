import { useState } from 'react';
import { toast } from 'sonner';
import { addToCart } from '@/services/cart.service';

/**
 * Hook for adding products to cart
 * Handles products with/without variants
 */
export const useAddToCart = () => {
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (product, variant = null) => {
    try {
      setLoading(true);

      // Check if product has variants
      const hasVariants = product.variants && product.variants.length > 0;

      // If product has variants but no variant selected, show error
      if (hasVariants && !variant) {
        toast.error('Please select a variant', {
          description: 'This product has multiple options. Please select one before adding to cart.',
        });
        return false;
      }

      // Prepare cart item data
      const cartItem = {
        productId: product._id,
        quantity: 1,
      };

      // Add variant ID if selected
      if (variant) {
        cartItem.variantId = variant._id;
      }

      // Add to cart
      await addToCart(cartItem);

      // Show success message with variant info
      let variantInfo = '';
      if (variant && variant.attributes) {
        const attrs = Object.entries(variant.attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        variantInfo = ` (${attrs})`;
      } else if (variant) {
        // Fallback for old format with color/size
        const attrs = [];
        if (variant.color) attrs.push(variant.color);
        if (variant.size) attrs.push(variant.size);
        variantInfo = attrs.length > 0 ? ` (${attrs.join(', ')})` : '';
      }
      
      toast.success('Added to cart', {
        description: `${product.name}${variantInfo} has been added to your cart`,
      });

      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));

      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.message || 'Failed to add item to cart';
      toast.error('Add to cart failed', {
        description: errorMessage,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleAddToCart,
    loading,
  };
};
