import { http, HttpResponse } from 'msw';
import { mockProducts } from './mockProducts';
import { mockReviews } from './mockReviews';
import { getVariantsByProductId, getVariantById, getTotalStockForProduct } from './mockVariants';
import { validateCredentials, emailExists, addUser, findUserById } from './mockUsers';
import { 
  validateDiscountCode, 
  calculateDiscountAmount, 
  getAvailableDiscountCodes,
  getDiscountCodeByCode,
  MOCK_DISCOUNT_CODES 
} from './mockDiscountCodes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to generate JWT token (mock)
const generateToken = (user) => {
  return btoa(JSON.stringify({ userId: user._id, email: user.email, role: user.role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
};

// Helper to verify token
const verifyToken = (token) => {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp < Date.now()) {
      return { valid: false, error: 'Token expired' };
    }
    return { valid: true, decoded };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
};

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return HttpResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials
    const result = validateCredentials(email, password);
    if (!result.valid) {
      return HttpResponse.json(
        { success: false, message: result.error },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(result.user);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = result.user;

    return HttpResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  }),

  http.post(`${API_BASE_URL}/api/auth/signup`, async ({ request }) => {
    const { fullname, email, phone, password } = await request.json();

    // Validate input
    if (!fullname || !email || !phone || !password) {
      return HttpResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return HttpResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email exists
    if (emailExists(email)) {
      return HttpResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = addUser({ fullname, email, phone, password });

    // Generate token
    const token = generateToken(newUser);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    return HttpResponse.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userWithoutPassword,
    });
  }),

  http.get(`${API_BASE_URL}/api/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const result = verifyToken(token);

    if (!result.valid) {
      return HttpResponse.json(
        { success: false, message: result.error },
        { status: 401 }
      );
    }

    const user = findUserById(result.decoded.userId);
    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    return HttpResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  }),

  http.post(`${API_BASE_URL}/api/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  // Products endpoints
  // Products endpoints
  http.get(`${API_BASE_URL}/api/products`, ({ request }) => {
    const url = new URL(request.url);
    const isFeatured = url.searchParams.get('isFeatured');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const brand = url.searchParams.get('brand');
    
    // Support both 'sortBy=field:order' and separate 'sortBy' and 'sortOrder' params
    const sortByParam = url.searchParams.get('sortBy') || 'createdAt';
    let sortBy = sortByParam;
    let sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    // Parse 'sortBy:order' format (e.g., 'totalUnitsSold:desc')
    if (sortByParam.includes(':')) {
      const [field, order] = sortByParam.split(':');
      sortBy = field;
      sortOrder = order || 'desc';
    }
    
    const minPrice = parseFloat(url.searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(url.searchParams.get('maxPrice') || 'Infinity');
    const minRating = parseFloat(url.searchParams.get('rating') || '0');
    const daysAgo = parseInt(url.searchParams.get('daysAgo') || '0');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const inStock = url.searchParams.get('inStock'); // New filter for stock availability

    let products = [
      ...mockProducts.featured,
      ...mockProducts.bestSellers,
      ...mockProducts.keychains,
      ...mockProducts.plushToys,
      ...mockProducts.accessories,
      ...mockProducts.newProducts,
    ];

    // Always remove duplicates first
    products = Array.from(
      new Map(products.map(p => [p._id, p])).values()
    );

    // Filter products with active variants (at least one variant must be active and have stock)
    if (inStock === 'true') {
      products = products.filter(p => {
        const totalStock = getTotalStockForProduct(p._id);
        return totalStock > 0;
      });
    }

    // Apply filters
    if (isFeatured === 'true') {
      products = products.filter(p => p.isFeatured);
    }

    // New products filter
    const isNew = url.searchParams.get('isNew');
    if (isNew === 'true') {
      // Filter products created in the last 30 days or marked as new
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      products = products.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate >= thirtyDaysAgo || p.isNew === true;
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        (p.brand && p.brand.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (category) {
      products = products.filter(p => {
        if (Array.isArray(p.categoryId)) {
          return p.categoryId.some(cat => 
            (cat._id || cat).toLowerCase() === category.toLowerCase() ||
            (cat.name || cat).toLowerCase().includes(category.toLowerCase())
          );
        }
        return false;
      });
    }

    // Brand filter
    if (brand) {
      products = products.filter(p => 
        p.brand && p.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    // Price range filter (using minPrice from product)
    if (minPrice > 0 || maxPrice !== Infinity) {
      products = products.filter(p => {
        const productMinPrice = p.minPrice || 0;
        const productMaxPrice = p.maxPrice || p.minPrice || 0;
        // Product overlaps with filter range
        return productMinPrice <= maxPrice && productMaxPrice >= minPrice;
      });
    }

    // Rating filter (minimum rating)
    if (minRating > 0) {
      products = products.filter(p => 
        (p.averageRating || p.rating || 0) >= minRating
      );
    }

    // Date filters
    if (daysAgo > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      products = products.filter(p => {
        const createdDate = p.createdAt ? new Date(p.createdAt) : new Date();
        return createdDate >= cutoffDate;
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      products = products.filter(p => {
        const createdDate = p.createdAt ? new Date(p.createdAt) : new Date();
        return createdDate >= start && createdDate <= end;
      });
    }

    // Sorting
    products.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case 'name':
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 'price':
          compareA = a.minPrice || a.price || 0;
          compareB = b.minPrice || b.price || 0;
          break;
        case 'rating':
          compareA = a.averageRating || a.rating || 0;
          compareB = b.averageRating || b.rating || 0;
          break;
        case 'totalUnitsSold':
          compareA = a.totalUnitsSold || 0;
          compareB = b.totalUnitsSold || 0;
          break;
        case 'createdAt':
        default:
          compareA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          compareB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
      }

      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });

    // Pagination
    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return HttpResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  }),

  http.get(`${API_BASE_URL}/api/products/categories`, () => {
    // Extract unique categories from all products
    const allProducts = [
      ...mockProducts.featured,
      ...mockProducts.bestSellers,
      ...mockProducts.keychains,
      ...mockProducts.plushToys,
      ...mockProducts.accessories,
      ...mockProducts.newProducts,
    ];

    const categoriesSet = new Set();
    allProducts.forEach(product => {
      if (product.category) {
        categoriesSet.add(product.category);
      }
    });

    const categories = Array.from(categoriesSet).map(name => ({
      _id: `cat-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }));

    return HttpResponse.json(categories);
  }),

  http.get(`${API_BASE_URL}/api/products/:id`, ({ params }) => {
    const { id } = params;
    const allProducts = [
      ...mockProducts.featured,
      ...mockProducts.bestSellers,
      ...mockProducts.keychains,
      ...mockProducts.plushToys,
      ...mockProducts.accessories,
      ...mockProducts.newProducts,
    ];

    const product = allProducts.find(p => p._id === id);

    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(product);
  }),

  // Variant endpoints
  http.get(`${API_BASE_URL}/api/products/:productId/variants`, ({ params }) => {
    const { productId } = params;
    const variants = getVariantsByProductId(productId);
    
    return HttpResponse.json({
      variants: variants,
      total: variants.length,
    });
  }),

  http.get(`${API_BASE_URL}/api/variants/:variantId`, ({ params }) => {
    const { variantId } = params;
    const variant = getVariantById(variantId);
    
    if (!variant) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(variant);
  }),

  // Reviews endpoints
  http.get(`${API_BASE_URL}/api/products/:productId/reviews`, ({ params, request }) => {
    const { productId } = params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt'; // createdAt, helpful
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'; // asc, desc

    // Get reviews from mock data
    let productReviews = mockReviews.filter(r => r.productId === productId);

    // Get reviews from localStorage
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const productLocalReviews = localReviews.filter(r => r.productId === productId);

    // Merge reviews
    let allReviews = [...productReviews, ...productLocalReviews];

    // Populate user data for each review
    allReviews = allReviews.map(review => {
      if (review.userId) {
        const user = findUserById(review.userId);
        if (user) {
          return {
            ...review,
            user: {
              _id: user._id,
              fullname: user.fullname,
              email: user.email,
            },
          };
        }
      }
      return {
        ...review,
        user: null,
      };
    });

    // Sort reviews
    allReviews.sort((a, b) => {
      let compareA, compareB;
      if (sortBy === 'helpful') {
        compareA = a.helpful || 0;
        compareB = b.helpful || 0;
      } else {
        compareA = new Date(a.createdAt).getTime();
        compareB = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });

    // Apply pagination
    const paginatedReviews = allReviews.slice(skip, skip + limit);

    return HttpResponse.json({
      reviews: paginatedReviews,
      total: allReviews.length,
      hasMore: skip + limit < allReviews.length,
      skip,
      limit,
    });
  }),

  http.get(`${API_BASE_URL}/api/reviews/:reviewId`, ({ params }) => {
    const { reviewId } = params;

    // Check mock reviews
    let review = mockReviews.find(r => r._id === reviewId);

    // Check localStorage reviews
    if (!review) {
      const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
      review = localReviews.find(r => r._id === reviewId);
    }

    if (!review) {
      return HttpResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    // Populate user data
    if (review.userId) {
      const user = findUserById(review.userId);
      if (user) {
        review = {
          ...review,
          user: {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
          },
        };
      }
    }

    return HttpResponse.json(review);
  }),

  http.post(`${API_BASE_URL}/api/products/:productId/reviews`, async ({ params, request }) => {
    const { productId } = params;
    const reviewData = await request.json();

    // Validate required fields
    if (!reviewData.content || reviewData.content.trim().length === 0) {
      return HttpResponse.json(
        { success: false, message: 'Review content is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const allProducts = [
      ...mockProducts.featured,
      ...mockProducts.bestSellers,
      ...mockProducts.keychains,
      ...mockProducts.plushToys,
      ...mockProducts.accessories,
      ...mockProducts.newProducts,
    ];
    const product = allProducts.find(p => p._id === productId);

    if (!product) {
      return HttpResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Create new review object following MongoDB schema
    const newReview = {
      _id: `673a${Date.now().toString(16)}`, // MongoDB-style ObjectId
      productId,
      userId: reviewData.userId || null,
      content: reviewData.content.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    localReviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(localReviews));

    // Populate user data for response
    let responseReview = { ...newReview };
    if (newReview.userId) {
      const user = findUserById(newReview.userId);
      if (user) {
        responseReview.user = {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
        };
      }
    }

    return HttpResponse.json({
      success: true,
      message: 'Review created successfully',
      review: responseReview,
    }, { status: 201 });
  }),

  http.patch(`${API_BASE_URL}/api/reviews/:reviewId`, async ({ params, request }) => {
    const { reviewId } = params;
    const updateData = await request.json();

    // Get reviews from localStorage (only localStorage reviews can be updated)
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const reviewIndex = localReviews.findIndex(r => r._id === reviewId);

    if (reviewIndex === -1) {
      return HttpResponse.json(
        { success: false, message: 'Review not found or cannot be updated' },
        { status: 404 }
      );
    }

    // Validate content if provided
    if (updateData.content !== undefined && updateData.content.trim().length === 0) {
      return HttpResponse.json(
        { success: false, message: 'Review content cannot be empty' },
        { status: 400 }
      );
    }

    // Update review (only content can be updated in this schema)
    if (updateData.content) {
      localReviews[reviewIndex].content = updateData.content.trim();
    }

    localStorage.setItem('reviews', JSON.stringify(localReviews));

    // Populate user data for response
    let updatedReview = { ...localReviews[reviewIndex] };
    if (updatedReview.userId) {
      const user = findUserById(updatedReview.userId);
      if (user) {
        updatedReview.user = {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
        };
      }
    }

    return HttpResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview,
    });
  }),

  http.delete(`${API_BASE_URL}/api/reviews/:reviewId`, ({ params }) => {
    const { reviewId } = params;

    // Get reviews from localStorage (only localStorage reviews can be deleted)
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const reviewIndex = localReviews.findIndex(r => r._id === reviewId);

    if (reviewIndex === -1) {
      return HttpResponse.json(
        { success: false, message: 'Review not found or cannot be deleted' },
        { status: 404 }
      );
    }

    // Remove review
    localReviews.splice(reviewIndex, 1);
    localStorage.setItem('reviews', JSON.stringify(localReviews));

    return HttpResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  }),

  // Get all reviews by a specific user
  http.get(`${API_BASE_URL}/api/users/:userId/reviews`, ({ params, request }) => {
    const { userId } = params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = parseInt(url.searchParams.get('skip') || '0');

    // Get reviews from mock data
    let userReviews = mockReviews.filter(r => r.userId === userId);

    // Get reviews from localStorage
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const userLocalReviews = localReviews.filter(r => r.userId === userId);

    // Merge and sort by date
    let allReviews = [...userReviews, ...userLocalReviews].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Populate product data for each review
    const allProducts = [
      ...mockProducts.featured,
      ...mockProducts.bestSellers,
      ...mockProducts.keychains,
      ...mockProducts.plushToys,
      ...mockProducts.accessories,
      ...mockProducts.newProducts,
    ];

    allReviews = allReviews.map(review => {
      const product = allProducts.find(p => p._id === review.productId);
      return {
        ...review,
        product: product ? {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          imageUrls: product.imageUrls,
        } : null,
      };
    });

    // Apply pagination
    const paginatedReviews = allReviews.slice(skip, skip + limit);

    return HttpResponse.json({
      reviews: paginatedReviews,
      total: allReviews.length,
      hasMore: skip + limit < allReviews.length,
    });
  }),

  // Cart endpoints
  http.get(`${API_BASE_URL}/api/cart`, () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Populate product and variant data
    const populatedCart = cart.map(item => {
      const allProducts = [
        ...mockProducts.featured,
        ...mockProducts.bestSellers,
        ...mockProducts.keychains,
        ...mockProducts.plushToys,
        ...mockProducts.accessories,
        ...mockProducts.newProducts,
      ];
      
      const product = allProducts.find(p => p._id === item.productId);
      const variant = item.variantId ? getVariantById(item.variantId) : null;
      
      return {
        ...item,
        product: product || null,
        variant: variant || null,
      };
    });
    
    return HttpResponse.json(populatedCart);
  }),

  http.post(`${API_BASE_URL}/api/cart`, async ({ request }) => {
    const cartItem = await request.json();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Support both old format (productId) and new format (productId + variantId)
    const productId = cartItem.productId || cartItem.product?._id;
    const variantId = cartItem.variantId;
    
    // Find existing cart item with same product and variant
    const existingItemIndex = cart.findIndex(item => {
      const itemProductId = item.productId || item.product?._id;
      const itemVariantId = item.variantId;
      
      if (variantId) {
        // New variant-based system: match both product and variant
        return itemProductId === productId && itemVariantId === variantId;
      } else {
        // Legacy system: match only product
        return itemProductId === productId && !itemVariantId;
      }
    });

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart[existingItemIndex].quantity += cartItem.quantity;
    } else {
      // Add new item
      const newCartItem = {
        _id: `cart-${Date.now()}`,
        productId,
        variantId,
        quantity: cartItem.quantity,
        // For backward compatibility, include product object if provided
        ...(cartItem.product && { product: cartItem.product }),
      };
      cart.push(newCartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    return HttpResponse.json(cart[existingItemIndex] || cart[cart.length - 1], { status: 201 });
  }),

  // Update cart item quantity
  http.patch(`${API_BASE_URL}/api/cart/:itemId`, async ({ params, request }) => {
    const { itemId } = params;
    const updates = await request.json();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const itemIndex = cart.findIndex(item => item._id === itemId);
    
    if (itemIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // Update the item
    cart[itemIndex] = {
      ...cart[itemIndex],
      ...updates,
    };
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Return populated item
    const item = cart[itemIndex];
    const allProducts = [
      ...mockProducts.featured,
      ...mockProducts.bestSellers,
      ...mockProducts.keychains,
      ...mockProducts.plushToys,
      ...mockProducts.accessories,
      ...mockProducts.newProducts,
    ];
    
    const product = allProducts.find(p => p._id === item.productId);
    const variant = item.variantId ? getVariantById(item.variantId) : null;
    
    return HttpResponse.json({
      ...item,
      product: product || null,
      variant: variant || null,
    });
  }),

  // Delete cart item
  http.delete(`${API_BASE_URL}/api/cart/:itemId`, ({ params }) => {
    const { itemId } = params;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const itemIndex = cart.findIndex(item => item._id === itemId);
    
    if (itemIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    cart.splice(itemIndex, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    return HttpResponse.json({ message: 'Item removed from cart' });
  }),

  // Clear cart
  http.delete(`${API_BASE_URL}/api/cart`, () => {
    localStorage.setItem('cart', JSON.stringify([]));
    return HttpResponse.json({ message: 'Cart cleared' });
  }),

  // Orders endpoints
  http.get(`${API_BASE_URL}/api/orders`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Mock orders from localStorage
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');

    // Apply filters
    if (status && status !== 'all') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.items.some(item => item.product?.name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    return HttpResponse.json(orders);
  }),

  http.post(`${API_BASE_URL}/api/orders`, async ({ request }) => {
    const orderData = await request.json();

    const newOrder = {
      _id: `order-${Date.now()}`,
      orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
      userId: 'mock-user-id',
      items: orderData.items,
      shippingAddress: orderData.shippingInfo,
      subtotal: orderData.subtotal,
      shippingFee: orderData.shipping,
      tax: orderData.tax,
      totalAmount: orderData.total,
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  // Discount Code endpoints
  http.post(`${API_BASE_URL}/api/discount-codes/validate`, async ({ request }) => {
    const { code, orderTotal } = await request.json();

    // Validate input
    if (!code) {
      return HttpResponse.json(
        { 
          success: false, 
          valid: false,
          message: 'Discount code is required' 
        },
        { status: 400 }
      );
    }

    // Validate discount code
    const validation = validateDiscountCode(code);

    if (!validation.valid) {
      return HttpResponse.json({
        success: false,
        valid: false,
        message: validation.message,
        discountCode: null,
      });
    }

    // Calculate discount amount if orderTotal provided
    let discountAmount = 0;
    if (orderTotal && validation.discountCode) {
      discountAmount = calculateDiscountAmount(validation.discountCode, orderTotal);
    }

    return HttpResponse.json({
      success: true,
      valid: true,
      message: validation.message,
      discountCode: {
        _id: validation.discountCode._id,
        code: validation.discountCode.code,
        value: validation.discountCode.value,
        remainingUses: validation.discountCode.usageLimit - validation.discountCode.usedCount,
        usageLimit: validation.discountCode.usageLimit,
        usedCount: validation.discountCode.usedCount,
      },
      discountAmount,
    });
  }),

  http.get(`${API_BASE_URL}/api/discount-codes`, ({ request }) => {
    const url = new URL(request.url);
    const available = url.searchParams.get('available') === 'true';

    let codes = [...MOCK_DISCOUNT_CODES];

    // Filter for available codes only
    if (available) {
      codes = getAvailableDiscountCodes();
    }

    // Add computed fields
    codes = codes.map(code => ({
      ...code,
      remainingUses: code.usageLimit - code.usedCount,
      isActive: code.usedCount < code.usageLimit,
    }));

    return HttpResponse.json({
      success: true,
      discountCodes: codes,
      total: codes.length,
    });
  }),

  http.get(`${API_BASE_URL}/api/discount-codes/:code`, ({ params }) => {
    const { code } = params;

    const discountCode = getDiscountCodeByCode(code);

    if (!discountCode) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Discount code not found',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      discountCode: {
        ...discountCode,
        remainingUses: discountCode.usageLimit - discountCode.usedCount,
        isActive: discountCode.usedCount < discountCode.usageLimit,
      },
    });
  }),

  http.post(`${API_BASE_URL}/api/discount-codes/:codeId/use`, async ({ params }) => {
    const { codeId } = params;

    // Get discount codes from localStorage (to track usage)
    const localCodes = JSON.parse(localStorage.getItem('discountCodes') || '[]');
    
    // Find in mock data
    let discountCode = MOCK_DISCOUNT_CODES.find(dc => dc._id === codeId);
    
    if (!discountCode) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Discount code not found',
        },
        { status: 404 }
      );
    }

    // Check if already tracked in localStorage
    let localCode = localCodes.find(lc => lc._id === codeId);
    
    if (localCode) {
      // Check if exhausted
      if (localCode.usedCount >= localCode.usageLimit) {
        return HttpResponse.json(
          {
            success: false,
            message: 'This discount code has reached its usage limit',
          },
          { status: 400 }
        );
      }
      
      // Increment usage
      localCode.usedCount += 1;
    } else {
      // Create new entry in localStorage
      localCode = {
        ...discountCode,
        usedCount: discountCode.usedCount + 1,
      };
      localCodes.push(localCode);
    }

    // Save updated codes
    localStorage.setItem('discountCodes', JSON.stringify(localCodes));

    return HttpResponse.json({
      success: true,
      message: 'Discount code applied successfully',
      discountCode: {
        ...localCode,
        remainingUses: localCode.usageLimit - localCode.usedCount,
      },
    });
  }),

  // ===== ADMIN PRODUCT CRUD OPERATIONS =====
  // Create product
  http.post(`${API_BASE_URL}/api/products`, async ({ request }) => {
    const productData = await request.json();
    
    const newProduct = {
      ...productData,
      _id: `product_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      soldCount: 0,
      averageRating: 0,
      totalReviews: 0,
    };

    return HttpResponse.json(newProduct, { status: 201 });
  }),

  // Update product (PUT)
  http.put(`${API_BASE_URL}/api/products/:id`, async ({ params, request }) => {
    const { id } = params;
    const productData = await request.json();
    
    const updatedProduct = {
      ...productData,
      _id: id,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(updatedProduct);
  }),

  // Partial update product (PATCH)
  http.patch(`${API_BASE_URL}/api/products/:id`, async ({ params, request }) => {
    const { id } = params;
    const productData = await request.json();
    
    const updatedProduct = {
      ...productData,
      _id: id,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(updatedProduct);
  }),

  // Delete product
  http.delete(`${API_BASE_URL}/api/products/:id`, ({ params }) => {
    const { id } = params;
    
    return HttpResponse.json({
      success: true,
      message: 'Product deleted successfully',
      productId: id,
    });
  }),

  // Bulk delete products
  http.post(`${API_BASE_URL}/api/products/bulk-delete`, async ({ request }) => {
    const { ids } = await request.json();
    
    return HttpResponse.json({
      success: true,
      message: `${ids.length} products deleted successfully`,
      deletedIds: ids,
    });
  }),
];
