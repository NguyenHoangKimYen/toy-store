/**
 * ========================================
 * API SERVICE USAGE EXAMPLES
 * ========================================
 * 
 * This file contains examples of how to use the API services.
 * DO NOT RUN THIS FILE - It's for reference only!
 * 
 * Copy the patterns you need into your actual components/hooks.
 */

import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  bulkDeleteProducts,
  uploadProductImages,
  getProductsByCategory
} from '@/services/products.service';

import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  bulkDeleteUsers,
  updateUserVerification,
  updateUserRole,
  updateUserPoints,
  getUserActivity
} from '@/services/users.service';

// ========================================
// 1. FETCHING DATA (GET)
// ========================================

// Example 1.1: Fetch all products (basic)
export const exampleFetchAllProducts = async () => {
  try {
    const data = await getProducts();
    console.log('All products:', data);
    // Response: { products: [...], stats: {...}, pagination: {...} }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 1.2: Fetch products with search query
export const exampleSearchProducts = async (searchQuery) => {
  try {
    const data = await getProducts({ 
      search: searchQuery 
    });
    console.log('Filtered products:', data.products);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 1.3: Fetch products with multiple filters
export const exampleFilteredProducts = async () => {
  try {
    const data = await getProducts({
      search: 'teddy bear',
      category: '671ff0010000000000000001',
      minPrice: 100000,
      maxPrice: 500000,
      isNew: true,
      isFeatured: false,
      inStock: true,
      sortBy: 'price',
      sortOrder: 'desc',
      page: 1,
      limit: 20
    });
    
    console.log('Products:', data.products);
    console.log('Total count:', data.pagination.total);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 1.4: Fetch single product by ID
export const exampleFetchProductById = async (productId) => {
  try {
    const product = await getProductById(productId);
    console.log('Product details:', product);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 1.5: Fetch all users (basic)
export const exampleFetchAllUsers = async () => {
  try {
    const data = await getUsers();
    console.log('All users:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 1.6: Fetch users with filters
export const exampleFilteredUsers = async () => {
  try {
    const data = await getUsers({
      search: 'john',
      role: 'customer',
      verified: true,
      hasSocialLogin: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 50
    });
    
    console.log('Users:', data.users);
    console.log('Stats:', data.stats);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ========================================
// 2. CREATING DATA (POST)
// ========================================

// Example 2.1: Create new product
export const exampleCreateProduct = async () => {
  try {
    const productData = {
      name: 'Gấu bông Teddy Bear',
      slug: 'gau-bong-teddy-bear',
      categoryId: '671ff0010000000000000001',
      description: 'Gấu bông dễ thương cho trẻ em',
      price: 250000,
      originalPrice: 300000,
      stockQuantity: 100,
      tags: ['671ff0020000000000000002'],
      isNew: true,
      isFeatured: false
    };

    const newProduct = await createProduct(productData);
    console.log('Product created:', newProduct);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 2.2: Create product with image upload
export const exampleCreateProductWithImages = async (imageFiles) => {
  try {
    const formData = new FormData();
    
    // Add product data
    formData.append('name', 'Gấu bông Premium');
    formData.append('slug', 'gau-bong-premium');
    formData.append('categoryId', '671ff0010000000000000001');
    formData.append('description', 'Gấu bông cao cấp');
    formData.append('price', 500000);
    formData.append('stockQuantity', 50);
    formData.append('isNew', true);
    
    // Add images
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    const newProduct = await createProduct(formData);
    console.log('Product with images created:', newProduct);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 2.3: Create new user
export const exampleCreateUser = async () => {
  try {
    const userData = {
      fullName: 'Nguyễn Văn A',
      username: 'nguyenvana',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      password: 'SecurePassword123!',
      role: 'customer',
      isVerified: false
    };

    const newUser = await createUser(userData);
    console.log('User created:', newUser);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ========================================
// 3. UPDATING DATA (PATCH/PUT)
// ========================================

// Example 3.1: Update product
export const exampleUpdateProduct = async (productId) => {
  try {
    const updates = {
      price: 220000,
      stockQuantity: 80,
      isFeatured: true
    };

    const updated = await updateProduct(productId, updates);
    console.log('Product updated:', updated);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 3.2: Update product with new images
export const exampleUpdateProductImages = async (productId, newImageFiles) => {
  try {
    const formData = new FormData();
    
    // Keep existing images (array of URLs)
    const existingImageUrls = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ];
    existingImageUrls.forEach(url => {
      formData.append('existingImages[]', url);
    });
    
    // Add new images
    newImageFiles.forEach(file => {
      formData.append('images', file);
    });
    
    // Add other updates
    formData.append('price', 180000);

    const updated = await updateProduct(productId, formData);
    console.log('Product images updated:', updated);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 3.3: Upload product images separately
export const exampleUploadImages = async (productId, imageFiles) => {
  try {
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    const result = await uploadProductImages(productId, formData);
    console.log('Images uploaded:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 3.4: Update user
export const exampleUpdateUser = async (userId) => {
  try {
    const updates = {
      fullName: 'Nguyễn Văn A Updated',
      email: 'newemail@example.com',
      phone: '0909999999'
    };

    const updated = await updateUser(userId, updates);
    console.log('User updated:', updated);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 3.5: Verify/Unverify user
export const exampleToggleUserVerification = async (userId, isVerified) => {
  try {
    const result = await updateUserVerification(userId, isVerified);
    console.log('User verification updated:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 3.6: Change user role
export const exampleChangeUserRole = async (userId) => {
  try {
    // Change to admin
    const result = await updateUserRole(userId, 'admin');
    console.log('User role updated:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 3.7: Update loyalty points
export const exampleUpdateLoyaltyPoints = async (userId) => {
  try {
    // Add 100 points
    const addPoints = await updateUserPoints(userId, 100);
    console.log('Points added:', addPoints);
    
    // Subtract 50 points
    const subtractPoints = await updateUserPoints(userId, -50);
    console.log('Points subtracted:', subtractPoints);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ========================================
// 4. DELETING DATA (DELETE)
// ========================================

// Example 4.1: Delete single product
export const exampleDeleteProduct = async (productId) => {
  try {
    await deleteProduct(productId);
    console.log('Product deleted successfully');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 4.2: Delete multiple products
export const exampleBulkDeleteProducts = async () => {
  try {
    const productIds = [
      '69081f9afababd7c10f7d7b2',
      '69081f9afababd7c10f7d7b3',
      '69081f9afababd7c10f7d7b4'
    ];

    const result = await bulkDeleteProducts(productIds);
    console.log('Deleted count:', result.deletedCount);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 4.3: Delete single user
export const exampleDeleteUser = async (userId) => {
  try {
    await deleteUser(userId);
    console.log('User deleted successfully');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 4.4: Delete multiple users
export const exampleBulkDeleteUsers = async () => {
  try {
    const userIds = [
      '68faebb94ceef331a4dbe7bd',
      '68faebb94ceef331a4dbe7be'
    ];

    const result = await bulkDeleteUsers(userIds);
    console.log('Deleted count:', result.deletedCount);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ========================================
// 5. USING IN REACT HOOKS
// ========================================

// Example 5.1: Custom hook for products
export const useProductsExample = (searchQuery) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getProducts({ search: searchQuery });
        setProducts(data.products || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Debounce
    const timer = setTimeout(fetchProducts, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return { products, loading, error };
};

// Example 5.2: Component with CRUD operations
export const ProductManagerExample = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data.products);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const handleCreate = async (productData) => {
    try {
      const newProduct = await createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Update product
  const handleUpdate = async (productId, updates) => {
    try {
      const updated = await updateProduct(productId, updates);
      setProducts(prev => 
        prev.map(p => p._id === productId ? updated : p)
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  // Delete product
  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, handleCreate, handleUpdate, handleDelete };
};

// ========================================
// 6. ERROR HANDLING PATTERNS
// ========================================

// Example 6.1: Try-catch with user feedback
export const exampleErrorHandling = async () => {
  try {
    const product = await getProductById('invalid-id');
    console.log(product);
  } catch (error) {
    // Error is already formatted by the service
    if (error.message.includes('404')) {
      console.error('Product not found');
    } else if (error.message.includes('Network')) {
      console.error('Network error - check your connection');
    } else {
      console.error('An error occurred:', error.message);
    }
  }
};

// Example 6.2: Async/await with loading state
export const exampleWithLoadingState = async (setLoading, setError) => {
  setLoading(true);
  setError(null);

  try {
    const data = await getProducts();
    return data;
  } catch (error) {
    setError(error.message);
    return null;
  } finally {
    setLoading(false);
  }
};

// ========================================
// 7. ADVANCED PATTERNS
// ========================================

// Example 7.1: Pagination
export const examplePagination = async (page = 1, limit = 20) => {
  try {
    const data = await getProducts({ page, limit });
    
    console.log('Current page:', data.pagination.currentPage);
    console.log('Total pages:', data.pagination.totalPages);
    console.log('Total items:', data.pagination.total);
    console.log('Has next:', data.pagination.hasNext);
    console.log('Has previous:', data.pagination.hasPrev);
    
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Example 7.2: Infinite scroll
export const exampleInfiniteScroll = async () => {
  let page = 1;
  let allProducts = [];
  let hasMore = true;

  while (hasMore) {
    try {
      const data = await getProducts({ page, limit: 20 });
      allProducts = [...allProducts, ...data.products];
      hasMore = data.pagination.hasNext;
      page++;
    } catch (error) {
      console.error('Error:', error.message);
      break;
    }
  }

  return allProducts;
};

// Example 7.3: Search with debounce
export const exampleSearchWithDebounce = () => {
  let timeoutId;

  const search = (query) => {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(async () => {
      try {
        const data = await getProducts({ search: query });
        console.log('Search results:', data.products);
      } catch (error) {
        console.error('Error:', error.message);
      }
    }, 500);
  };

  return search;
};

// Example 7.4: Optimistic updates
export const exampleOptimisticUpdate = async (productId, updates, setProducts) => {
  // Update UI immediately
  setProducts(prev => 
    prev.map(p => p._id === productId ? { ...p, ...updates } : p)
  );

  try {
    // Send to server
    await updateProduct(productId, updates);
  } catch (error) {
    // Revert on error
    console.error('Update failed, reverting:', error.message);
    const original = await getProductById(productId);
    setProducts(prev => 
      prev.map(p => p._id === productId ? original : p)
    );
  }
};

// ========================================
// 8. REAL-WORLD COMPONENT EXAMPLE
// ========================================

export const RealWorldProductListExample = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Fetch with debounce
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getProducts({ 
          search: searchQuery,
          page,
          limit: 20 
        });
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, page]);

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure?')) return;

    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (error) {
      alert('Delete failed: ' + error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search products..."
      />

      {products.map(product => (
        <div key={product._id}>
          <h3>{product.name}</h3>
          <p>{product.price}</p>
          <button onClick={() => handleDelete(product._id)}>
            Delete
          </button>
        </div>
      ))}

      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
};

/**
 * ========================================
 * NOTES:
 * ========================================
 * 
 * 1. All functions handle errors automatically
 * 2. Responses are already parsed (no need for .json())
 * 3. Loading states should be managed in your components
 * 4. Use debouncing for search (500ms recommended)
 * 5. Always use try-catch for error handling
 * 6. FormData is used for file uploads
 * 7. Query parameters are automatically encoded
 * 
 * ========================================
 */