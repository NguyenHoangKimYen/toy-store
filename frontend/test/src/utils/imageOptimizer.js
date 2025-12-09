/**
 * Image Optimization Utilities
 * Provides functions to optimize image loading and delivery
 */

/**
 * Generate optimized image URL for S3 with query parameters
 * Note: S3 doesn't support resize params by default, but this prepares for CloudFront + Lambda@Edge
 * For now, returns original URL but ready for future optimization
 * 
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @param {number} options.width - Desired width
 * @param {number} options.quality - Image quality (1-100)
 * @param {string} options.format - Image format (webp, jpeg, png)
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || url.includes('/placeholder.png')) {
    return url;
  }

  const {
    width = null,
    quality = 85,
    format = 'webp'
  } = options;

  // For future CloudFront + Lambda@Edge implementation
  // This structure is ready for query-based image optimization
  const params = new URLSearchParams();
  
  if (width) {
    params.append('w', width);
  }
  
  if (quality !== 85) {
    params.append('q', quality);
  }
  
  if (format !== 'webp') {
    params.append('f', format);
  }

  // Return original URL for now
  // When CloudFront + Lambda@Edge is set up, uncomment this:
  // const separator = url.includes('?') ? '&' : '?';
  // return params.toString() ? `${url}${separator}${params.toString()}` : url;
  
  return url;
};

/**
 * Generate srcset for responsive images
 * Creates multiple sizes for different screen resolutions
 * 
 * @param {string} url - Original image URL
 * @param {Array<number>} sizes - Array of widths (e.g., [300, 600, 900])
 * @returns {string} srcset string
 */
export const generateSrcSet = (url, sizes = [300, 600, 900, 1200]) => {
  if (!url || url.includes('/placeholder.png')) {
    return url;
  }

  return sizes
    .map(size => `${getOptimizedImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Preload critical images (above the fold)
 * Call this for hero images or first product images
 * 
 * @param {string} url - Image URL to preload
 * @param {string} type - Image type (e.g., 'image/webp')
 */
export const preloadImage = (url, type = 'image/webp') => {
  if (!url || typeof window === 'undefined') {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  if (type) {
    link.type = type;
  }
  document.head.appendChild(link);
};

/**
 * Get image format support
 * Checks browser support for modern image formats
 * 
 * @returns {Promise<Object>} Object with format support flags
 */
export const getImageFormatSupport = async () => {
  const formats = {
    webp: false,
    avif: false
  };

  // Check WebP support
  const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  const webpImg = new Image();
  webpImg.src = webpData;
  await webpImg.decode().then(() => {
    formats.webp = true;
  }).catch(() => {
    formats.webp = false;
  });

  // Check AVIF support
  const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  const avifImg = new Image();
  avifImg.src = avifData;
  await avifImg.decode().then(() => {
    formats.avif = true;
  }).catch(() => {
    formats.avif = false;
  });

  return formats;
};

/**
 * Get recommended sizes attribute for responsive images
 * Based on common breakpoints
 * 
 * @param {string} usage - Image usage context ('product-card', 'hero', 'thumbnail')
 * @returns {string} sizes attribute value
 */
export const getImageSizes = (usage = 'product-card') => {
  const sizesMap = {
    'product-card': '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px',
    'product-detail': '(max-width: 768px) 100vw, 600px',
    'hero': '100vw',
    'thumbnail': '100px',
    'cart-item': '100px'
  };

  return sizesMap[usage] || sizesMap['product-card'];
};

export default {
  getOptimizedImageUrl,
  generateSrcSet,
  preloadImage,
  getImageFormatSupport,
  getImageSizes
};
