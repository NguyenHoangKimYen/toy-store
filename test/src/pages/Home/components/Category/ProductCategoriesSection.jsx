import React, { useEffect, useState } from 'react';
import { Tag, Sparkles, Package } from 'lucide-react';
import { useProducts } from '@/hooks';
import { getCategories } from '@/services/categories.service';
import CategorySection from './CategorySection';

const CategoryHeader = () => (
  <div className="text-center mb-8">
    <h2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.4] font-extrabold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
      Shop by Category
    </h2>
    <p className="text-base md:text-lg text-slate-500 font-medium">Discover our curated collections</p>
  </div>
);

const ProductCategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
  
  if (loading) {
    return (
      <section className="px-[5%] py-10 bg-gradient-to-b from-white to-slate-50">
        <CategoryHeader />
        <div className="text-center py-10">
          <p>Loading products...</p>
        </div>
      </section>
    );
  }
  
  if (!hasAnyProducts) {
    return (
      <section className="px-[5%] py-10 bg-gradient-to-b from-white to-slate-50">
        <CategoryHeader />
        <div className="text-center py-10">
          <p>No products available.</p>
        </div>
      </section>
    );
  }

  return (
    <div className="py-10 bg-gradient-to-b from-rose-100 via-pink-100 to-purple-100">
      <section className="px-[5%]">
        <CategoryHeader />

        <div className="max-w-[1600px] mx-auto space-y-0">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              title={category.title}
              subtitle={category.subtitle}
              products={category.products}
              viewAllLink={category.link}
              showIcon={true}
              icon={category.icon}
              iconBgColor={category.bgColor}
              iconGradient={category.gradient}
            />
          ))}
        </div>
      </section>
      
    </div>
    
  );
};

export default ProductCategoriesSection;
