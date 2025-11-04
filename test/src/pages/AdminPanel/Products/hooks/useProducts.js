import { useState, useEffect } from 'react'
import { getProducts } from '@/services/products.service'

export const useProducts = (searchQuery = '') => {
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
                    const data = await getProducts({ 
                        search: searchQuery,
                        // Add other filters as needed:
                        // category: selectedCategory,
                        // minPrice: minPrice,
                        // maxPrice: maxPrice,
                        // isNew: true,
                        // isFeatured: false,
                        // inStock: true,
                        // sortBy: 'name',
                        // sortOrder: 'asc',
                        // page: 1,
                        // limit: 50
                    })

                    // Backend can return array or object with products property
                    const productsArray = Array.isArray(data) ? data : data.products || []

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
