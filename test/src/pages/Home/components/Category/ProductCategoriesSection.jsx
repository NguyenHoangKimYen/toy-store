import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/common';
import { ArrowRight, Tag, Sparkles, Package } from 'lucide-react';
import { mockProducts } from '@/mocks';
import './ProductCategoriesSection.css';

const ProductCategoriesSection = () => {
  const navigate = useNavigate();

  // TEMPORARILY: Always use mock data for testing
  const productsData = mockProducts;

  // Debug logging
  console.log('ProductCategoriesSection - Using MOCK data');

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  const categories = [
    {
      id: 'sales',
      title: 'Sales & Deals',
      subtitle: 'Hot deals you don\'t want to miss',
      icon: <Tag className="w-6 h-6" />,
      products: productsData.bestSellers,
      link: '/products?filter=bestsellers',
      gradient: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50',
    },
    {
      id: 'keychains',
      title: 'Móc Khóa',
      subtitle: 'Stylish keychains for everyday carry',
      icon: <Sparkles className="w-6 h-6" />,
      products: productsData.keychains,
      link: '/products?category=keychains',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'plushies',
      title: 'Gấu Bông',
      subtitle: 'Soft and cuddly companions',
      icon: <Package className="w-6 h-6" />,
      products: productsData.plushToys,
      link: '/products?category=plush',
      gradient: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
    },
    {
      id: 'accessories',
      title: 'Accessories',
      subtitle: 'Complete your collection',
      icon: <Package className="w-6 h-6" />,
      products: productsData.accessories,
      link: '/products?category=accessories',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
  ];


  const handleViewAll = (link) => {
    navigate(link);
  };

  // If all categories are empty, show a message
  const hasAnyProducts = categories.some(cat => cat.products && cat.products.length > 0);
  
  if (!hasAnyProducts) {
    console.log('No products in any category!');
    return (
      <section className="product-categories-section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Discover our curated collections</p>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No products available. Using fallback data...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="product-categories-section">
      <div className="section-header">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">Discover our curated collections</p>
      </div>

      <div className="categories-container">
        {categories.map((category) => {
          const displayProducts = category.products.slice(0, 12);
          
          if (displayProducts.length === 0) return null;

          return (
            <div key={category.id} className="category-row">
              <div className="category-row-header">
                <div className="category-title-wrapper">
                  <div className={`category-icon ${category.bgColor}`}>
                    <div className={`icon-gradient bg-gradient-to-br ${category.gradient}`}>
                      {category.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="category-row-title">{category.title}</h3>
                    <p className="category-row-subtitle">{category.subtitle}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleViewAll(category.link)}
                  variant="outline"
                  className="view-more-button"
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="products-horizontal-scroll">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    variant="horizontal"
                    showBadges={false}
                    showCategory={false}
                    showQuickView={false}
                    onClick={handleProductClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductCategoriesSection;
