/**
 * Cache Control Middleware
 * Sets appropriate cache headers for different types of responses
 * to improve PageSpeed cache efficiency scores
 */

// Cache durations (in seconds)
const CACHE_DURATIONS = {
  // Static assets (images, fonts, etc.) - 1 year
  STATIC: 31536000,
  // API responses that rarely change (categories, etc.) - 1 hour
  SEMI_STATIC: 3600,
  // API responses that change moderately (products list) - 5 minutes
  MODERATE: 300,
  // API responses that change frequently (cart, user data) - no cache
  DYNAMIC: 0,
  // Immutable assets (versioned files) - 1 year
  IMMUTABLE: 31536000,
};

/**
 * Static assets cache middleware
 * For images, fonts, and other static files
 */
const staticCacheMiddleware = (req, res, next) => {
  // Only apply to GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const url = req.url.toLowerCase();
  
  // Check for static file extensions
  const staticExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  const isStatic = staticExtensions.some(ext => url.includes(ext));
  
  if (isStatic) {
    res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATIONS.STATIC}, immutable`);
    res.setHeader('Vary', 'Accept-Encoding');
  }
  
  next();
};

/**
 * API cache middleware
 * Sets appropriate cache headers based on endpoint type
 */
const apiCacheMiddleware = (req, res, next) => {
  // Only apply to GET requests
  if (req.method !== 'GET') {
    // For mutations, ensure no caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return next();
  }

  const url = req.path.toLowerCase();
  
  // Routes that should never be cached (user-specific data)
  const noCacheRoutes = [
    '/api/users',
    '/api/auth',
    '/api/carts',
    '/api/orders',
    '/api/payments',
    '/api/addresses',
    '/api/vouchers',
    '/api/loyalty',
    '/api/reviews/eligibility',
  ];
  
  // Routes that can be cached for longer (rarely change)
  const semiStaticRoutes = [
    '/api/categories',
    '/api/badges',
  ];
  
  // Routes with moderate cache (change occasionally)
  const moderateRoutes = [
    '/api/products',
    '/api/reviews/product',
    '/api/reviews/stats',
    '/api/comments',
  ];

  // Check route type and set headers
  const isNoCache = noCacheRoutes.some(route => url.startsWith(route));
  const isSemiStatic = semiStaticRoutes.some(route => url.startsWith(route));
  const isModerate = moderateRoutes.some(route => url.startsWith(route));

  if (isNoCache) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  } else if (isSemiStatic) {
    res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATIONS.SEMI_STATIC}, stale-while-revalidate=86400`);
    res.setHeader('Vary', 'Accept-Encoding');
  } else if (isModerate) {
    res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATIONS.MODERATE}, stale-while-revalidate=3600`);
    res.setHeader('Vary', 'Accept-Encoding');
  } else {
    // Default: short cache with revalidation
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }

  next();
};

/**
 * Compression hint middleware
 * Adds hints for CDN/proxy compression
 */
const compressionHintsMiddleware = (req, res, next) => {
  // Indicate that responses can be compressed
  res.setHeader('Vary', 'Accept-Encoding');
  next();
};

/**
 * ETag support for conditional requests
 * Reduces bandwidth for unchanged resources
 */
const etagMiddleware = (req, res, next) => {
  // Express already has built-in ETag support, just ensure it's enabled
  // This is handled by app.set('etag', 'strong') in server.js
  next();
};

module.exports = {
  staticCacheMiddleware,
  apiCacheMiddleware,
  compressionHintsMiddleware,
  etagMiddleware,
  CACHE_DURATIONS,
};
