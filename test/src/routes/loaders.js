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
 * Home page loader - fetches all data needed for home page
 */
export async function homeLoader() {
  try {
    // Fetch categories first
    const categories = await getCategories();
    
    // Build category config for the first 4 categories
    const categoryConfig = categories.slice(0, 4).map(cat => ({
      key: cat.slug,
      categoryId: cat._id,
      name: cat.name,
      limit: 12
    }));

    // Fetch all products in parallel with deduplication
    const [
      featuredResponse,
      newProductsResponse,
      bestSellersResponse,
      ...categoryResponses
    ] = await Promise.all([
      // Featured products
      dedupedFetch('featured-6', () => getProducts({ isFeatured: true, limit: 6 })),
      // New arrivals
      dedupedFetch('new-8', () => getProducts({ isNew: true, limit: 8 })),
      // Best sellers
      dedupedFetch('bestsellers-8', () => getProducts({ isBestSeller: true, limit: 8 })),
      // Products by category
      ...categoryConfig.map(cat => 
        dedupedFetch(`cat-${cat.categoryId}-${cat.limit}`, () => 
          getProducts({ categoryId: cat.categoryId, limit: cat.limit })
        )
      )
    ]);

    // Extract products arrays from responses
    const featuredProducts = featuredResponse.products || featuredResponse || [];
    const newProducts = newProductsResponse.products || newProductsResponse || [];
    const bestSellers = bestSellersResponse.products || bestSellersResponse || [];

    // Map category products back to their configs
    const categorizedByCategory = {};
    categoryConfig.forEach((cat, index) => {
      const response = categoryResponses[index];
      categorizedByCategory[cat.key] = response.products || response || [];
    });

    return {
      categories,
      categoryConfig,
      categorizedProducts: {
        featured: featuredProducts,
        newProducts,
        bestSellers,
        ...categorizedByCategory
      }
    };
  } catch (error) {
    console.error('Error loading home page data:', error);
    throw new Response('Failed to load home page', { status: 500, statusText: error.message });
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
