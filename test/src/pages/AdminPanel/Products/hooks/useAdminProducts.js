import { useState, useEffect } from 'react'
import { getProducts } from '@/services/products.service'

/**
 * Hook for fetching and managing products in admin panel
 * 
 * PAGINATION CONFIGURATION:
 * - Products per page: 50 (reasonable for admin management)
 * - Allows efficient product browsing without overwhelming UI
 * - Backend default: 20, we override with explicit value
 * 
 * @param {string} searchQuery - Search keyword for filtering products
 */
export const useAdminProducts = (searchQuery = '') => {
    // Admin shows more items per page for efficient management
    const ADMIN_PRODUCTS_PER_PAGE = 50;
    
    const [products, setProducts] = useState([])
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStock: 0,
        totalSold: 0,
        outOfStock: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Debounce
        const delayTimer = setTimeout(() => {
            const fetchProducts = async () => {
                try {
                    setLoading(true)
                    setError(null)

                    // Fetch from backend with filters
                    const params = {};
                    
                    // Add search query (backend expects 'keyword')
                    if (searchQuery) {
                        params.keyword = searchQuery;
                    }
                    
                    // Show all products including drafts for admin
                    params.status = 'all';
                    
                    // Explicit limit to override backend default (20)
                    params.limit = ADMIN_PRODUCTS_PER_PAGE;
                    // Add other filters as needed:
                    // params.categoryId = selectedCategory;
                    // params.minPrice = minPrice;
                    // params.maxPrice = maxPrice;
                    // params.isFeatured = true;
                    // params.minRating = 4;
                    // params.sort = 'name:asc'; // field:order format
                    
                    const data = await getProducts(params)

                    // Backend returns { products: [...], pagination: {...} }
                    const productsArray = Array.isArray(data) ? data : (data.products || [])

                    // Calculate stats from products
                    const calculatedStats = {
                        totalProducts: productsArray.length,
                        totalStock: productsArray.reduce((sum, p) => sum + (p.stockQuantity || 0), 0),
                        totalSold: productsArray.reduce((sum, p) => sum + (p.soldCount || 0), 0),
                        outOfStock: productsArray.filter(p => p.stockQuantity === 0).length,
                    }

                    setProducts(productsArray)
                    setStats(data.stats || calculatedStats)

                } catch (err) {
                    setError(err.message)
                    console.error('Error fetching products:', err)
                    setProducts([])
                } finally {
                    setLoading(false)
                }
            }

            fetchProducts()
        }, 500)

        // Cleanup: Cancel the timer if user types again before 500ms
        return () => clearTimeout(delayTimer)
    }, [searchQuery]) // Re-fetch when search query changes

    return {
        products,
        stats,
        loading,
        error,
    }
}
