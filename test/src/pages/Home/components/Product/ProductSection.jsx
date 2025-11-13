import React from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ProductCard from './ProductCard'

const ProductSection = ({ 
  title, 
  subtitle, 
  icon, 
  products = [], 
  accentColor = 'blue',
  isDark = false 
}) => {
  const navigate = useNavigate()

  const colorClasses = {
    blue: {
      bg: isDark ? 'bg-blue-900' : 'bg-blue-50',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-700',
      icon: 'text-blue-500'
    },
    purple: {
      bg: isDark ? 'bg-purple-900' : 'bg-purple-50',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-700',
      icon: 'text-purple-500'
    },
    pink: {
      bg: isDark ? 'bg-pink-900' : 'bg-pink-50',
      text: 'text-pink-600',
      hover: 'hover:bg-pink-700',
      icon: 'text-pink-500'
    },
    rose: {
      bg: isDark ? 'bg-rose-900' : 'bg-rose-50',
      text: 'text-rose-600',
      hover: 'hover:bg-rose-700',
      icon: 'text-rose-500'
    },
    indigo: {
      bg: isDark ? 'bg-indigo-900' : 'bg-indigo-50',
      text: 'text-indigo-600',
      hover: 'hover:bg-indigo-700',
      icon: 'text-indigo-500'
    }
  }

  const colors = colorClasses[accentColor] || colorClasses.blue

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className={`py-16 ${colors.bg} ${isDark ? 'dark' : ''}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-white'} ${colors.icon}`}>
              {icon}
            </div>
            <div>
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                {subtitle}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${colors.text} ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:shadow-lg'}`}
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard 
              key={product._id} 
              product={product}
              accentColor={accentColor}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductSection
