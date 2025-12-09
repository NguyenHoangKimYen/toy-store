/**
 * Parse Decimal128 price from MongoDB
 * @param {*} price - Can be number, string, or Decimal128 object
 * @returns {number} - Parsed price as number
 */
export const parsePrice = (price) => {
  if (!price && price !== 0) return 0;
  
  // Handle Decimal128 format: { $numberDecimal: "450000" }
  if (typeof price === 'object' && price !== null && price.$numberDecimal) {
    return parseFloat(price.$numberDecimal);
  }
  
  // Handle string
  if (typeof price === 'string') {
    return parseFloat(price);
  }
  
  // Already a number
  if (typeof price === 'number') {
    return price;
  }
  
  return 0;
};

/**
 * Calculate total stock from variants
 * Backend uses: stockQuantity
 * @param {Array} variants - Product variants
 * @returns {number} - Total stock quantity
 */
export const calculateTotalStock = (variants) => {
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    return 0;
  }
  
  return variants.reduce((total, variant) => {
    // Backend field is stockQuantity
    return total + (variant.stockQuantity || 0);
  }, 0);
};

/**
 * Get min and max price from variants
 * @param {Array} variants - Product variants
 * @returns {Object} - { minPrice, maxPrice }
 */
export const getPriceRange = (variants) => {
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    return { minPrice: 0, maxPrice: 0 };
  }
  
  const prices = variants.map(v => parsePrice(v.price)).filter(p => p > 0);
  
  if (prices.length === 0) {
    return { minPrice: 0, maxPrice: 0 };
  }
  
  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices)
  };
};
