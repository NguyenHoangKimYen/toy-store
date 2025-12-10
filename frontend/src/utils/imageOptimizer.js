/**
 * Image Optimization Utilities
 * Enterprise-grade image optimization like Netflix/Instagram
 */

// Browser format support cache
let formatSupportCache = null;

/**
 * Generate optimized image URL for S3 with query parameters
 * Ready for CloudFront + Lambda@Edge integration
 * 
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || url.includes('/placeholder.png') || url.startsWith('data:')) {
    return url;
  }

  const {
    width = null,
    quality = 85,
    format = 'webp'
  } = options;

  // For future CloudFront + Lambda@Edge implementation
  // When enabled, add query params: ?w=300&q=85&f=webp
  const params = new URLSearchParams();
  
  if (width) params.append('w', width);
  if (quality !== 85) params.append('q', quality);
  if (format !== 'webp') params.append('f', format);

  // Uncomment when CloudFront + Lambda@Edge is set up:
  // const separator = url.includes('?') ? '&' : '?';
  // return params.toString() ? `${url}${separator}${params.toString()}` : url;
  
  return url;
};

/**
 * Generate srcset for responsive images
 * Common sizes optimized for modern devices
 */
export const generateSrcSet = (url, sizes = [320, 480, 640, 768, 1024, 1280]) => {
  if (!url || url.includes('/placeholder.png') || url.startsWith('data:')) {
    return '';
  }

  return sizes
    .map(size => `${getOptimizedImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Preload critical images (above the fold)
 * Use for hero images, first visible products
 */
export const preloadImage = (url, options = {}) => {
  if (!url || typeof window === 'undefined') return;

  const { 
    as = 'image',
    type = 'image/webp',
    fetchPriority = 'high'
  } = options;

  // Check if already preloaded
  const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  link.fetchPriority = fetchPriority;
  if (type) link.type = type;
  
  document.head.appendChild(link);
};

/**
 * Preload multiple critical images in parallel
 */
export const preloadImages = (urls, options = {}) => {
  urls.forEach(url => preloadImage(url, options));
};

/**
 * Preconnect to image CDN for faster loading
 * Call once at app startup
 */
export const preconnectImageCDN = () => {
  if (typeof window === 'undefined') return;

  const cdnOrigins = [
    'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com',
    // Add CloudFront URL when available
  ];

  cdnOrigins.forEach(origin => {
    // Preconnect
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = origin;
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);

    // DNS prefetch as fallback
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = origin;
    document.head.appendChild(dnsPrefetch);
  });
};

/**
 * Get image format support (cached)
 */
export const getImageFormatSupport = async () => {
  if (formatSupportCache) return formatSupportCache;

  const formats = { webp: false, avif: false };

  // Check WebP
  try {
    const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    const img = new Image();
    img.src = webpData;
    await img.decode();
    formats.webp = true;
  } catch {
    formats.webp = false;
  }

  // Check AVIF
  try {
    const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQ==';
    const img = new Image();
    img.src = avifData;
    await img.decode();
    formats.avif = true;
  } catch {
    formats.avif = false;
  }

  formatSupportCache = formats;
  return formats;
};

/**
 * Get recommended sizes attribute based on usage context
 */
export const getImageSizes = (usage = 'product-card') => {
  const sizesMap = {
    'product-card': '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px',
    'product-detail': '(max-width: 768px) 100vw, 600px',
    'hero': '100vw',
    'thumbnail': '100px',
    'cart-item': '80px',
    'category': '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
  };

  return sizesMap[usage] || sizesMap['product-card'];
};

/**
 * Generate blur placeholder SVG (LQIP - Low Quality Image Placeholder)
 */
export const generateBlurPlaceholder = (color = '#e5e7eb', width = 1, height = 1) => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='${encodeURIComponent(color)}' width='${width}' height='${height}'/%3E%3C/svg%3E`;
};

/**
 * Check if image is in viewport (for manual lazy loading)
 */
export const isImageInViewport = (element, offset = 200) => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.bottom >= -offset
  );
};

export default {
  getOptimizedImageUrl,
  generateSrcSet,
  preloadImage,
  preloadImages,
  preconnectImageCDN,
  getImageFormatSupport,
  getImageSizes,
  generateBlurPlaceholder,
  isImageInViewport,
};
