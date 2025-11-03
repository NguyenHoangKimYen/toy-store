import { useState, useEffect } from 'react'
import { mockProducts } from './mockData'

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

                    // Query to backend
                    const params = new URLSearchParams()
                    if (searchQuery) {
                        params.append('search', searchQuery)
                    }

                    // ----BACKEND----
                    // const response = await fetch(`/api/products?${params.toString()}`)
                    // if (!response.ok) {
                    //   throw new Error(`Error: ${response.status}`)
                    // }
                    // const data = await response.json()
                    // setProducts(data.products)
                    // setStats(data.stats)

                    // MOCK
                    await new Promise(resolve => setTimeout(resolve, 500))

                    // Simulate backend filtering
                    let filtered = mockProducts
                    if (searchQuery) {
                        const query = searchQuery.toLowerCase()
                        filtered = mockProducts.filter(product =>
                            product.name.toLowerCase().includes(query) ||
                            product.categoryId.name.toLowerCase().includes(query) ||
                            product.slug.toLowerCase().includes(query)
                        )
                    }

                    // Simulate backend calculating stats
                    const calculatedStats = {
                        totalProducts: filtered.length,
                        totalStock: filtered.reduce((sum, p) => sum + p.stockQuantity, 0),
                        totalSold: filtered.reduce((sum, p) => sum + p.soldCount, 0),
                        outOfStock: filtered.filter(p => p.stockQuantity === 0).length,
                    }

                    setProducts(filtered)
                    setStats(calculatedStats)

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
