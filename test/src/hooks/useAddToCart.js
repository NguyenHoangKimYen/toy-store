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

      // Add to cart using the cart hook with variantId
      await addItem(product._id, 1, variantId);

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
