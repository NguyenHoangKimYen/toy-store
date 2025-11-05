import { useState, useEffect } from 'react';
import { getProducts } from '../../../services/products.service';

export const useProductsByCategory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorizedProducts, setCategorizedProducts] = useState({
    featured: [],
    newProducts: [],
    bestSellers: [],
    keychains: [],
    plushToys: [],
    figures: [],
    accessories: [],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getProducts({});

        if (!Array.isArray(allProducts)) {
          throw new Error('Invalid products data');
        }

        // Categorize products
        const categorized = {
          featured: allProducts.filter(p => p.isFeatured).slice(0, 6),
          newProducts: allProducts.filter(p => p.isNew).slice(0, 8),
          bestSellers: allProducts.filter(p => p.isBestSeller).slice(0, 8),
          keychains: allProducts.filter(p => 
            p.categoryId?.name?.toLowerCase().includes('móc khóa') ||
            p.categoryId?.name?.toLowerCase().includes('keychain')
          ).slice(0, 8),
          plushToys: allProducts.filter(p => 
            p.categoryId?.name?.toLowerCase().includes('gấu bông') ||
            p.categoryId?.name?.toLowerCase().includes('plush')
          ).slice(0, 8),
          figures: allProducts.filter(p => 
            p.categoryId?.name?.toLowerCase().includes('figure') ||
            p.categoryId?.name?.toLowerCase().includes('mô hình')
          ).slice(0, 8),
          accessories: allProducts.filter(p => 
            p.categoryId?.name?.toLowerCase().includes('phụ kiện') ||
            p.categoryId?.name?.toLowerCase().includes('accessories')
          ).slice(0, 8),
        };

        setCategorizedProducts(categorized);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { categorizedProducts, loading, error };
};
