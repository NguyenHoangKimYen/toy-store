import { http, HttpResponse } from 'msw';
import { mockProducts } from './mockProducts';
import { mockReviews } from './mockReviews';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const handlers = [
  // Products endpoints
  http.get(`${API_BASE_URL}/api/products`, ({ request }) => {
    const url = new URL(request.url);
    const isFeatured = url.searchParams.get('isFeatured');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy');
    const minPrice = parseFloat(url.searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(url.searchParams.get('maxPrice') || 'Infinity');
    const daysAgo = parseInt(url.searchParams.get('daysAgo') || '0');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let products = [
      ...mockProducts.featured,
      ...mockProducts.bestSellers,
      ...mockProducts.keychains,
      ...mockProducts.plushToys,
      ...mockProducts.accessories,
      ...mockProducts.newProducts,
    ];

    // Apply filters
    if (isFeatured === 'true') {
      products = products.filter(p => p.isFeatured);
    }

    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Price range filter
    if (minPrice > 0 || maxPrice !== Infinity) {
      products = products.filter(p => {
        const price = p.salePrice || p.price;
        return price >= minPrice && price <= maxPrice;
      });
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
    if (sortBy === 'totalUnitsSold:desc') {
      products.sort((a, b) => (b.totalUnitsSold || 0) - (a.totalUnitsSold || 0));
    } else if (sortBy === 'price:asc') {
      products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price:desc') {
      products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'createdAt:desc') {
      products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'rating:desc') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // Apply limit
    products = products.slice(0, limit);

    return HttpResponse.json(products);
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

  // Reviews endpoints
  http.get(`${API_BASE_URL}/api/products/:productId/reviews`, ({ params, request }) => {
    const { productId } = params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = parseInt(url.searchParams.get('skip') || '0');

    // Get reviews from mock data
    let productReviews = mockReviews.filter(r => r.productId === productId);

    // Get reviews from localStorage
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const productLocalReviews = localReviews.filter(r => r.productId === productId);

    // Merge and sort by date
    let allReviews = [...productReviews, ...productLocalReviews].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Apply pagination
    const paginatedReviews = allReviews.slice(skip, skip + limit);

    return HttpResponse.json({
      reviews: paginatedReviews,
      total: allReviews.length,
      hasMore: skip + limit < allReviews.length,
    });
  }),

  http.get(`${API_BASE_URL}/api/products/:productId/reviews/stats`, ({ params }) => {
    const { productId } = params;

    // Get all reviews for this product
    const productReviews = mockReviews.filter(r => r.productId === productId);
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const productLocalReviews = localReviews.filter(r => r.productId === productId);
    const allReviews = [...productReviews, ...productLocalReviews];

    if (allReviews.length === 0) {
      return HttpResponse.json({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    }

    // Calculate stats
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    allReviews.forEach(review => {
      distribution[review.rating]++;
      totalRating += review.rating;
    });

    return HttpResponse.json({
      averageRating: totalRating / allReviews.length,
      totalReviews: allReviews.length,
      distribution,
    });
  }),

  http.post(`${API_BASE_URL}/api/products/:productId/reviews`, async ({ params, request }) => {
    const { productId } = params;
    const reviewData = await request.json();

    // Create new review object
    const newReview = {
      _id: `review-${Date.now()}`,
      productId,
      userId: reviewData.userId || null,
      userName: reviewData.userName || 'Anonymous',
      userAvatar: reviewData.userAvatar || null,
      rating: reviewData.rating,
      content: reviewData.content,
      createdAt: new Date().toISOString(),
      helpful: 0,
      verified: !!reviewData.userId,
    };

    // Save to localStorage
    const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    localReviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(localReviews));

    return HttpResponse.json(newReview, { status: 201 });
  }),

  // Cart endpoints
  http.get(`${API_BASE_URL}/api/cart`, () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return HttpResponse.json(cart);
  }),

  http.post(`${API_BASE_URL}/api/cart`, async ({ request }) => {
    const cartItem = await request.json();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItemIndex = cart.findIndex(
      item => item.product._id === cartItem.product._id
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += cartItem.quantity;
    } else {
      cart.push({
        _id: `cart-${Date.now()}`,
        ...cartItem,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    return HttpResponse.json(cart[existingItemIndex] || cart[cart.length - 1], { status: 201 });
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
];
