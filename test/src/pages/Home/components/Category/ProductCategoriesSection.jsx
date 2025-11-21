import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/common';
import { ArrowRight, Tag, Sparkles, Package } from 'lucide-react';
import { useProducts } from '@/hooks'; // Using global hook
import { getCategories } from '@/services/categories.service';
import './ProductCategoriesSection.css';

const ProductCategoriesSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Use global products hook
  const { products: allProducts, loading: productsLoading } = useProducts();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(productsLoading);
        
        // Fetch categories (products come from hook)
        const categoriesResponse = await getCategories();
          
        const allCategories = Array.isArray(categoriesResponse)
          ? categoriesResponse
          : (categoriesResponse.categories || categoriesResponse.data || []);
        
        console.log('Fetched:', allProducts.length, 'products,', allCategories.length, 'categories');
        
        // Create category sections with their products
        const categoryData = allCategories.slice(0, 4).map((category, index) => {
          const categoryProducts = allProducts.filter(p => 
            Array.isArray(p.categoryId) 
              ? p.categoryId.some(catId => catId === category._id || catId._id === category._id)
              : p.categoryId === category._id || p.categoryId?._id === category._id
          ).slice(0, 12);
          
          // Icon rotation for visual variety
          const icons = [
            { icon: <Tag className="w-6 h-6" />, gradient: 'from-red-500 to-orange-500', bgColor: 'bg-red-50' },
            { icon: <Sparkles className="w-6 h-6" />, gradient: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
            { icon: <Package className="w-6 h-6" />, gradient: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-50' },
            { icon: <Package className="w-6 h-6" />, gradient: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50' },
          ];
          
          const iconData = icons[index % icons.length];
          
          return {
            id: category._id,
            title: category.name,
            subtitle: category.description || 'Discover our collection',
            icon: iconData.icon,
            products: categoryProducts,
            link: `/products?category=${category._id}`,
            gradient: iconData.gradient,
            bgColor: iconData.bgColor,
          };
        }).filter(cat => cat.products.length > 0);
        
        // If no categories have products, add a featured section
        if (categoryData.length === 0 && allProducts.length > 0) {
          categoryData.push({
            id: 'featured',
            title: 'Featured Products',
            subtitle: 'Check out our popular items',
            icon: <Tag className="w-6 h-6" />,
            products: allProducts.slice(0, 12),
            link: '/products',
            gradient: 'from-red-500 to-orange-500',
            bgColor: 'bg-red-50',
          });
        }
        
        setCategories(categoryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [allProducts, productsLoading]);

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  const handleViewAll = (link) => {
    navigate(link);
  };

  // If all categories are empty, show a message
  const hasAnyProducts = categories.some(cat => cat.products && cat.products.length > 0);
  
  if (loading) {
    return (
      <section className="product-categories-section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Discover our curated collections</p>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading products...</p>
        </div>
      </section>
    );
  }
  
  if (!hasAnyProducts) {
    console.log('No products in any category!');
    return (
      <section className="product-categories-section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Discover our curated collections</p>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No products available.</p>
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
          // Show fewer products on mobile for better performance
          const isMobile = window.innerWidth < 768;
          const productLimit = isMobile ? 6 : 12;
          const displayProducts = category.products.slice(0, productLimit);
          
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

              <div className="products-scroll-container">
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
                {/* Scroll indicator for mobile */}
                <div className="scroll-indicator"></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductCategoriesSection;
