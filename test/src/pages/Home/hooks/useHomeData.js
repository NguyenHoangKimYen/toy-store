import { useState, useEffect } from 'react';
import { getProducts } from '@/services';
import { getCategories } from '@/services/categories.service';

/* Fetches all homepage data in parallel with unified loading states */
export const useHomeData = () => {
  const [data, setData] = useState({
    featuredProducts: [],
    newProducts: [],
    bestSellers: [],
    categories: [],
  });
  
  const [loading, setLoading] = useState({
    featured: true,
    new: true,
    bestSellers: true,
    categories: true,
  });
  
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [featuredRes, newRes, bestSellersRes, categoriesRes] = await Promise.allSettled([
          getProducts({ isFeatured: true, limit: 6 }),
          getProducts({ sort: 'createdAt:desc', limit: 8 }),
          getProducts({ sort: 'totalUnitsSold:desc', limit: 12 }),
          getCategories(),
        ]);

        const extractProducts = (res) => {
          if (res.status !== 'fulfilled') return [];
          return res.value.products || res.value || [];
        };

        const extractCategories = (res) => {
          if (res.status !== 'fulfilled') return [];
          if (Array.isArray(res.value)) return res.value;
          return res.value.categories || res.value.data || [];
        };

        setData({
          featuredProducts: extractProducts(featuredRes),
          newProducts: extractProducts(newRes),
          bestSellers: extractProducts(bestSellersRes),
          categories: extractCategories(categoriesRes),
        });

        setLoading({
          featured: false,
          new: false,
          bestSellers: false,
          categories: false,
        });
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError(err.message);
        setLoading({ featured: false, new: false, bestSellers: false, categories: false });
      }
    };

    fetchAllData();
  }, []);

  return {
    ...data,
    loading,
    isLoading: Object.values(loading).some(Boolean),
    isFullyLoaded: Object.values(loading).every(v => !v),
    error,
  };
};

export default useHomeData;
