import { useState } from 'react';
import { toast } from 'sonner';
import { useCart } from './useCart';

/**
 * Hook for adding products to cart
 * Handles products with/without variants
 */
export const useAddToCart = () => {
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = async (product, variant = null) => {
    const startTime = performance.now();
    
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

      // Get variant ID if variant is provided
      const variantId = variant?._id || variant?.id;

      console.log('[ADD TO CART] Starting...', { productId: product._id, variantId });
      const addStartTime = performance.now();
      
      // Add to cart using the cart hook with variantId
      await addItem(product._id, 1, variantId);
      
      console.log('[ADD TO CART] Completed in', (performance.now() - addStartTime).toFixed(0), 'ms');

      // Show success message with variant info
      let variantInfo = '';
      if (variant?.attributes && Array.isArray(variant.attributes)) {
        // New format: attributes is an array of {name, value}
        const attrs = variant.attributes
          .map((attr) => `${attr.name}: ${attr.value}`)
          .join(', ');
        variantInfo = ` (${attrs})`;
      } else if (variant?.attributes && typeof variant.attributes === 'object') {
        // Old format: attributes is an object
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

      console.log('[ADD TO CART] Total time:', (performance.now() - startTime).toFixed(0), 'ms');
      return true;
    } catch (err) {
      console.error('[ADD TO CART] Error after', (performance.now() - startTime).toFixed(0), 'ms:', err);
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
