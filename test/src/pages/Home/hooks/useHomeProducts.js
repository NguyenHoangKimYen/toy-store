import { useState, useEffect } from 'react';
import { getProducts } from '@/services/products.service';

export const useHomeProducts = () => {
  const [loading, setLoading] = useState(true);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categorizedProducts, setCategorizedProducts] = useState({
    newProducts: [],
    bestSellers: [],
    keychains: [],
    plushies: [],
    accessories: [],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Fetch all products and categorize them
        const allProducts = await getProducts({});
        setProducts(allProducts);

        // Get featured product (first featured item)
        const featured = await getProducts({ isFeatured: true, limit: 1 });
        setFeaturedProduct(featured[0] || null);

        // Fetch categorized products
        const [newProducts, bestSellers, keychains, plushies, accessories] = await Promise.all([
          getProducts({ isNew: true, limit: 8 }),
          getProducts({ isBestSeller: true, limit: 12 }),
          getProducts({ category: 'keychains', limit: 12 }),
          getProducts({ category: 'plush', limit: 12 }),
          getProducts({ category: 'accessories', limit: 12 }),
        ]);

        setCategorizedProducts({
          newProducts,
          bestSellers,
          keychains,
          plushies,
          accessories,
        });
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { loading, featuredProduct, products, categorizedProducts };
};
