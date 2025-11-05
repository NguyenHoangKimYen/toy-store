import React from 'react'
import { Sparkles, TrendingUp, Heart, ShoppingBag } from 'lucide-react'
import { HeroSection } from './components/Hero'
import { ProductSection } from './components/Product'
import { CTABanner } from './components/Banner'
import { useHomeProducts } from './hooks/useHomeProducts'

const Home = () => {
  const { loading, featuredProduct, products, categorizedProducts } = useHomeProducts()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection 
        featuredProduct={featuredProduct} 
        totalProducts={products.length} 
      />

      {/* New Products Section */}
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh drops you can't miss"
        icon={<Sparkles className="w-6 h-6" />}
        products={categorizedProducts.newProducts}
        accentColor="blue"
      />

      {/* Best Sellers Section */}
      <ProductSection
        title="Best Sellers"
        subtitle="Customer favorites that keep selling out"
        icon={<TrendingUp className="w-6 h-6" />}
        products={categorizedProducts.bestSellers}
        accentColor="purple"
        isDark
      />

      {/* Keychains Section */}
      <ProductSection
        title="Móc Khóa"
        subtitle="Stylish keychains for your everyday carry"
        icon={<Heart className="w-6 h-6" />}
        products={categorizedProducts.keychains}
        accentColor="pink"
      />

      {/* Plushies Section */}
      <ProductSection
        title="Gấu Bông"
        subtitle="Adorable plushies that bring joy"
        icon={<Heart className="w-6 h-6" />}
        products={categorizedProducts.plushies}
        accentColor="rose"
        isDark
      />

      {/* Accessories Section */}
      <ProductSection
        title="Accessories"
        subtitle="Complete your look with premium accessories"
        icon={<ShoppingBag className="w-6 h-6" />}
        products={categorizedProducts.accessories}
        accentColor="indigo"
      />

      {/* CTA Banner */}
      <CTABanner />
    </div>
  )
}

export default Home
