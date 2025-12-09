import { 
  getProducts, 
  getProductById,
  getCategories 
} from '../services';

// Request deduplication cache - prevents duplicate parallel requests
const requestCache = new Map();
const CACHE_TTL = 100; // 100ms cache to deduplicate rapid requests

const dedupedFetch = async (key, fetchFn) => {
  const now = Date.now();
  const cached = requestCache.get(key);
  
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.promise;
  }
  
  const promise = fetchFn();
  requestCache.set(key, { promise, timestamp: now });
  
  // Clear cache entry after TTL
  setTimeout(() => requestCache.delete(key), CACHE_TTL);
  
  return promise;
};

/**
 * Home page loader - fetches only critical above-the-fold data
 * Optimized for instant navigation - only loads featured products initially
 */
export async function homeLoader() {
  try {
    // Fetch ONLY critical above-the-fold data in parallel
    // Don't wait for everything - let components load rest progressively
    const [
      featuredResponse,
      newProductsResponse,
    ] = await Promise.all([
      // Featured products for hero carousel (critical)
      dedupedFetch('featured-6', () => getProducts({ isFeatured: true, limit: 6 })),
      // New arrivals (above the fold)
      dedupedFetch('new-8', () => getProducts({ isNew: true, limit: 8 })),
    ]);

    // Extract products arrays from responses
    const featuredProducts = featuredResponse.products || featuredResponse || [];
    const newProducts = newProductsResponse.products || newProductsResponse || [];

    // Return minimal data for instant render
    // Best sellers and category products will load in components
    return {
      categorizedProducts: {
        featured: featuredProducts,
        newProducts,
        // These will be loaded by components after initial render
        bestSellers: [],
      }
    };
  } catch (error) {
    console.error('Error loading home page data:', error);
    // Don't block navigation on error - let page render with fallbacks
    return {
      categorizedProducts: {
        featured: [],
        newProducts: [],
        bestSellers: [],
      }
    };
  }
}

/**
 * Products page loader - fetches products with filters
 */
export async function productsLoader({ request }) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams);
    
    const response = await getProducts(searchParams);
    const categories = await getCategories();
    
    // Extract products array from response
    const products = response.products || response || [];
    
    return { products, categories, searchParams };
  } catch (error) {
    console.error('Error loading products:', error);
    throw new Response('Failed to load products', { status: 500, statusText: error.message });
  }
}

/**
 * Product detail loader - fetches single product
 */
export async function productDetailLoader({ params }) {
  try {
    const { id } = params;
    const product = await getProductById(id);
    
    if (!product) {
      throw new Response('Product not found', { status: 404, statusText: 'The product you are looking for does not exist' });
    }
    
    return { product };
  } catch (error) {
    console.error('Error loading product:', error);
    if (error instanceof Response) {
      throw error;
    }
    if (error.response?.status === 404) {
      throw new Response('Product not found', { status: 404, statusText: 'The product you are looking for does not exist' });
    }
    throw new Response('Failed to load product', { status: 500, statusText: error.message });
  }
}

/**
 * Categories loader - for collection/category pages
 */
export async function categoriesLoader() {
  try {
    const categories = await getCategories();
    return { categories };
  } catch (error) {
    console.error('Error loading categories:', error);
    throw new Response('Failed to load categories', { status: 500, statusText: error.message });
  }
}
