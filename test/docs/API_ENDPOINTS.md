# API Endpoints Documentation

Base URL: `https://milkybloom.us-east-1.elasticbeanstalk.com` (configurable via `VITE_API_URL`)

## Table of Contents
- [Authentication](#authentication)
- [Products](#products)
- [Variants](#variants)
- [Users](#users)
- [Cart](#cart)
- [Orders](#orders)
- [Reviews](#reviews)
- [Discount Codes](#discount-codes)
- [Categories](#categories)

---

## Authentication

### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "fullname": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "fullname": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signup successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "fullname": "John Doe",
    "email": "user@example.com"
  }
}
```

### GET `/api/auth/me`
Get current authenticated user details.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "fullname": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### POST `/api/auth/logout`
Logout current user.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Products

### GET `/api/products`
Get all products with optional filters.

**Query Parameters:**
- `search` - Search query for name/description/brand
- `category` - Filter by category ID
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `isNew` - Filter new products (boolean)
- `isFeatured` - Filter featured products (boolean)
- `inStock` - Filter products in stock (boolean)
- `sortBy` - Sort field (name, price, createdAt, soldCount)
- `sortOrder` - Sort order (asc, desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### GET `/api/products/:id`
Get a single product by ID.

**Response:**
```json
{
  "_id": "product_id",
  "name": "Product Name",
  "description": "Product description",
  "brand": "Brand Name",
  "price": { "$numberDecimal": "99.99" },
  "imageUrls": ["url1", "url2"],
  "categoryId": [...],
  "variants": [...],
  "stockQuantity": 100,
  "averageRating": 4.5,
  "soldCount": 50
}
```

### POST `/api/products`
Create a new product (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "brand": "Brand Name",
  "isFeatured": false,
  "imageUrls": ["url1", "url2"],
  "categoryId": ["cat_id_1"],
  "variants": [
    {
      "attributes": { "Color": "Red", "Size": "M" },
      "price": { "$numberDecimal": "99.99" },
      "stock": 50
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": { ... }
}
```

### PUT `/api/products/:id`
Update a product (full update, Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:** Same as POST `/api/products`

### PATCH `/api/products/:id`
Partially update a product (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:** Any subset of product fields

### DELETE `/api/products/:id`
Delete a product (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### POST `/api/products/bulk-delete`
Delete multiple products (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "ids": ["product_id_1", "product_id_2"]
}
```

### GET `/api/products/categories`
Get all product categories.

**Response:**
```json
[
  {
    "_id": "cat_id",
    "name": "Category Name",
    "productCount": 10
  }
]
```

### POST `/api/products/:productId/images`
Upload product images (Admin only).

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:** FormData with image files

### DELETE `/api/products/:productId/images/:imageId`
Delete a product image (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

---

## Variants

### GET `/api/products/:productId/variants`
Get all variants for a product.

**Response:**
```json
{
  "variants": [
    {
      "_id": "variant_id",
      "attributes": { "Color": "Red", "Size": "M" },
      "price": { "$numberDecimal": "99.99" },
      "stock": 50,
      "isActive": true
    }
  ],
  "total": 10
}
```

### GET `/api/variants/:variantId`
Get a single variant by ID.

### POST `/api/products/:productId/variants`
Create a new variant for a product (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "attributes": { "Color": "Blue", "Size": "L" },
  "price": { "$numberDecimal": "109.99" },
  "stock": 30
}
```

### PUT `/api/variants/:variantId`
Update a variant (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

### DELETE `/api/variants/:variantId`
Delete a variant (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

---

## Users

### GET `/api/users`
Get all users with filters (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `search` - Search query
- `role` - Filter by role (admin/user)
- `verified` - Filter by verification status
- `sortBy` - Sort field
- `sortOrder` - Sort order (asc/desc)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "users": [...],
  "stats": {
    "totalUsers": 100,
    "activeUsers": 85,
    "adminUsers": 5
  },
  "pagination": { ... }
}
```

### GET `/api/users/:id`
Get a user by ID (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

### POST `/api/users`
Create a new user (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

### PUT `/api/users/:id`
Update a user (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

### PATCH `/api/users/:id`
Partially update a user (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

### DELETE `/api/users/:id`
Delete a user (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

### POST `/api/users/bulk-delete`
Delete multiple users (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "ids": ["user_id_1", "user_id_2"]
}
```

### PATCH `/api/users/:id/verify`
Update user verification status (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "verified": true
}
```

### PATCH `/api/users/:id/role`
Update user role (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "role": "admin"
}
```

### PATCH `/api/users/:id/points`
Update user loyalty points (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "points": 100
}
```

### GET `/api/users/:id/activity`
Get user activity history (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

---

## Cart

### GET `/api/cart`
Get user's cart items.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "_id": "cart_item_id",
    "productId": "product_id",
    "variantId": "variant_id",
    "quantity": 2,
    "product": { ... },
    "variant": { ... }
  }
]
```

### POST `/api/cart`
Add item to cart.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "product_id",
  "variantId": "variant_id",
  "quantity": 1
}
```

### PATCH `/api/cart/:itemId`
Update cart item quantity.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE `/api/cart/:itemId`
Remove item from cart.

**Headers:**
- `Authorization: Bearer <token>`

### DELETE `/api/cart` or `/api/cart/clear`
Clear entire cart.

**Headers:**
- `Authorization: Bearer <token>`

---

## Orders

### GET `/api/orders`
Get all orders for authenticated user.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Filter by order status
- `sort` - Sort field
- `search` - Search query

**Response:**
```json
[
  {
    "_id": "order_id",
    "userId": "user_id",
    "items": [...],
    "totalAmount": 199.99,
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET `/api/orders/:orderId`
Get a single order by ID.

**Headers:**
- `Authorization: Bearer <token>`

### POST `/api/orders`
Create a new order.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "variantId": "variant_id",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": { ... },
  "paymentMethod": "credit_card"
}
```

### PATCH `/api/orders/:orderId/status`
Update order status (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "shipped"
}
```

### POST `/api/orders/:orderId/cancel`
Cancel an order.

**Headers:**
- `Authorization: Bearer <token>`

---

## Reviews

### GET `/api/products/:productId/reviews`
Get reviews for a product.

**Query Parameters:**
- `limit` - Items per page
- `skip` - Items to skip
- `sortBy` - Sort field
- `sortOrder` - Sort order (asc/desc)

**Response:**
```json
{
  "reviews": [
    {
      "_id": "review_id",
      "productId": "product_id",
      "userId": "user_id",
      "content": "Great product!",
      "rating": 5,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "user": { ... }
    }
  ],
  "total": 50,
  "pagination": { ... }
}
```

### GET `/api/reviews/:reviewId`
Get a single review by ID.

### POST `/api/products/:productId/reviews`
Create a new review for a product.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Great product!",
  "rating": 5
}
```

### PATCH `/api/reviews/:reviewId`
Update a review.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Updated review text"
}
```

### DELETE `/api/reviews/:reviewId`
Delete a review.

**Headers:**
- `Authorization: Bearer <token>`

### GET `/api/users/:userId/reviews`
Get all reviews by a specific user.

**Query Parameters:**
- `limit` - Items per page
- `skip` - Items to skip

---

## Discount Codes

### POST `/api/discount-codes/validate`
Validate a discount code.

**Request Body:**
```json
{
  "code": "SAVE20",
  "orderTotal": 100.00
}
```

**Response:**
```json
{
  "valid": true,
  "discountCode": {
    "_id": "code_id",
    "code": "SAVE20",
    "type": "percentage",
    "value": 20,
    "description": "20% off"
  },
  "discountAmount": 20.00
}
```

### GET `/api/discount-codes`
Get all available discount codes (Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `isActive` - Filter by active status
- `type` - Filter by type (percentage/fixed)

### GET `/api/discount-codes/:code`
Get a specific discount code by code string.

**Headers:**
- `Authorization: Bearer <token>`

### POST `/api/discount-codes/:codeId/use`
Mark a discount code as used.

**Headers:**
- `Authorization: Bearer <token>`

---

## Categories

### GET `/api/categories`
Get all categories (currently returns through products/categories endpoint).

---

## Notes

### Authentication
- Most endpoints require authentication via Bearer token in Authorization header
- Admin-only endpoints require the user to have `role: "admin"`
- Tokens are JWT format with 7-day expiration

### Mock Data
- Mock Service Worker (MSW) handlers are available in `/src/mocks/handlers.js`
- Toggle between mock and real API using `VITE_USE_MOCK_DATA` environment variable

### Error Responses
Standard error response format:
```json
{
  "success": false,
  "message": "Error message here",
  "errors": []  // Optional field for validation errors
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
