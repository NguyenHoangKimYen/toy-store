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
        
        // Fetch each category from backend with proper filters
        const [featured, newProducts, bestSellers, keychains, plushToys, figures, accessories] = await Promise.all([
          getProducts({ isFeatured: true }).then(products => products.slice(0, 6)),
          getProducts({ isNew: true }).then(products => products.slice(0, 8)),
          getProducts({ isBestSeller: true }).then(products => products.slice(0, 12)),
          getProducts({ category: 'keychains' }).then(products => products.slice(0, 12)),
          getProducts({ category: 'plush' }).then(products => products.slice(0, 12)),
          getProducts({ category: 'figures' }).then(products => products.slice(0, 12)),
          getProducts({ category: 'accessories' }).then(products => products.slice(0, 12)),
        ]);

        setCategorizedProducts({
          featured,
          newProducts,
          bestSellers,
          keychains,
          plushToys,
          figures,
          accessories,
        });
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
