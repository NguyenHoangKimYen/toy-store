import { useState, useEffect, useMemo } from 'react'

export const useProducts = (searchQuery = '') => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/product')
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    
    const query = searchQuery.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.categoryId.name.toLowerCase().includes(query) ||
      product.slug.toLowerCase().includes(query)
    )
  }, [products, searchQuery])


  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stockQuantity, 0),
    totalSold: products.reduce((sum, p) => sum + p.soldCount, 0),
    outOfStock: products.filter(p => p.stockQuantity === 0).length,
  }), [products])

  return {
    products,
    filteredProducts,
    stats,
    loading,
    error,
  }
}
