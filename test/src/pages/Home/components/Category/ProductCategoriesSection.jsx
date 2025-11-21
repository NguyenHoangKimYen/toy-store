import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Sparkles, Package, ArrowRight } from 'lucide-react';
import { useProducts } from '@/hooks';
import { getCategories } from '@/services/categories.service';
import { ProductCard } from '@/components/common';
import './ProductCategoriesSection.css';

const ProductCategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const navigate = useNavigate();
  
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

  const hasAnyProducts = categories.some(cat => cat.products && cat.products.length > 0);
  const activeCategory = categories[activeTabIndex] || null;

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  const handleViewAll = () => {
    if (activeCategory?.link) {
      navigate(activeCategory.link);
    }
  };
  
  if (loading) {
    return (
      <section className="px-[5%] py-10 bg-gradient-to-b from-white to-slate-50">
        <div className="text-center py-10">
          <p>Loading categories...</p>
        </div>
      </section>
    );
  }
  
  if (!hasAnyProducts) {
    return (
      <section className="px-[5%] py-10 bg-gradient-to-b from-white to-slate-50">
        <div className="text-center py-10">
          <p>No products available.</p>
        </div>
      </section>
    );
  }

  return (
    <div className="multi-category-container">
      {/* Tab Navigation */}
      <div className="tab-container">
        <div className="tab-content-container">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`tab-item ${index === activeTabIndex ? 'tab-active' : ''}`}
              onClick={() => setActiveTabIndex(index)}
            >
              {category.title}
            </div>
          ))}
        </div>
      </div>

      {/* Active Category Content */}
      {activeCategory && (
        <div 
          className="tab-content-item-container"
          style={{
            backgroundImage: activeCategory.backgroundImage ? `url(${activeCategory.backgroundImage})` : 'none',
            backgroundColor: activeCategory.backgroundImage ? 'transparent' : '#f8f9fa',
          }}
        >
          <div className="content-container">
            <div className="product-cards-wrapper">
              {activeCategory.products.slice(0, 10).map((product) => (
                <div key={product._id} className="card-item-wrapper">
                  <ProductCard
                    product={product}
                    showBadges={false}
                    showCategory={false}
                    showQuickView={false}
                    showAddToCart={false}
                    onClick={() => handleProductClick(product)}
                  />
                </div>
              ))}
            </div>

            {/* View More Button */}
            <button onClick={handleViewAll} className="view-more-btn">
              View All <ArrowRight className="ml-2 h-4 w-4 inline" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCategoriesSection;
