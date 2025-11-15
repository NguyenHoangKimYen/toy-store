/**
 * Format price in VND (Vietnamese Dong)
 * @param {number} price - Price in VND
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (price == null || isNaN(price)) return '0₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format price with custom format (without currency symbol)
 * @param {number} price - Price in VND
 * @returns {string} Formatted price string
 */
export const formatPriceNumber = (price) => {
  if (price == null || isNaN(price)) return '0';
  
  return new Intl.NumberFormat('vi-VN').format(price);
};

/**
 * Parse formatted price string to number
 * @param {string} priceStr - Formatted price string
 * @returns {number} Price as number
 */
export const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  return Number(priceStr.replace(/[^\d]/g, ''));
};
