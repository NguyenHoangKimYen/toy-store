# API Endpoints Documentation

This document lists all API endpoints used by the frontend application. Use this to map with the real backend implementation.

## Base URL
- Development: `http://localhost:5000`
- Production: Configure via `VITE_API_URL` environment variable

---

## Products

### Get All Products
```
GET /api/products
```
**Query Parameters:**
- `category` (string) - Filter by category ID
- `search` (string) - Search products by name
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `sort` (string) - Sort order: 'price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest', 'rating'
- `limit` (number) - Number of results per page
- `skip` (number) - Number of results to skip (pagination)

**Response:**
```json
{
  "products": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### Get Single Product
```
GET /api/products/:id
```
**Response:** Product object with attributes and variant references

### Get Product Categories
```
GET /api/products/categories
```
**Response:** Array of category objects

### Create Product (Admin)
```
POST /api/products
```
**Body:** Product data

### Update Product (Admin)
```
PUT /api/products/:id
PATCH /api/products/:id
```
**Body:** Product data (full or partial)

### Delete Product (Admin)
```
DELETE /api/products/:id
```

### Bulk Delete Products (Admin)
```
POST /api/products/bulk-delete
```
**Body:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

### Upload Product Images (Admin)
```
POST /api/products/:productId/images
```
**Body:** FormData with image files

### Delete Product Image (Admin)
```
DELETE /api/products/:productId/images/:imageId
```

---

## Variants

### Get All Variants for a Product
```
GET /api/products/:productId/variants
```
**Response:**
```json
{
  "variants": [
    {
      "_id": "var1-1",
      "productId": "1",
      "sku": "PREM-KEY-METAL-SILVER",
      "attributes": [
        { "name": "Material", "value": "Metal" },
        { "name": "Color", "value": "Silver" }
      ],
      "price": 625000,
      "stockQuantity": 45,
      "weight": 50,
      "imageUrls": ["..."],
      "isActive": true
    }
  ],
  "total": 3
}
```

### Get Single Variant
```
GET /api/variants/:variantId
```
**Response:** Variant object

### Create Variant (Admin)
```
POST /api/products/:productId/variants
```
**Body:** Variant data

### Update Variant (Admin)
```
PUT /api/variants/:variantId
```
**Body:** Variant data

### Delete Variant (Admin)
```
DELETE /api/variants/:variantId
```

---

## Cart

### Get Cart
```
GET /api/cart
```
**Response:** Array of cart items with populated product and variant data
```json
[
  {
    "_id": "cart-123",
    "productId": "1",
    "variantId": "var1-1",
    "quantity": 2,
    "product": { /* full product object */ },
    "variant": { /* full variant object */ }
  }
]
```

### Add to Cart
```
POST /api/cart
```
**Body:**
```json
{
  "productId": "1",
  "variantId": "var1-1",
  "quantity": 1
}
```
**Response:** Created/updated cart item

### Update Cart Item Quantity
```
PATCH /api/cart/:itemId
```
**Body:**
```json
{
  "quantity": 3
}
```
**Response:** Updated cart item with populated data

### Remove Cart Item
```
DELETE /api/cart/:itemId
```

### Clear Cart
```
DELETE /api/cart
```

---

## Orders

### Get All Orders
```
GET /api/orders
```
**Query Parameters:**
- `status` (string) - Filter by order status
- `search` (string) - Search by order number or product name

**Response:** Array of order objects

### Create Order
```
POST /api/orders
```
**Body:**
```json
{
  "items": [
    {
      "productId": "1",
      "variantId": "var1-1",
      "quantity": 2,
      "price": 625000
    }
  ],
  "shippingInfo": {
    "fullName": "John Doe",
    "phone": "0123456789",
    "address": "123 Street",
    "city": "Ho Chi Minh",
    "district": "District 1",
    "ward": "Ward 1"
  },
  "subtotal": 1250000,
  "shippingFee": 30000,
  "total": 1280000,
  "paymentMethod": "COD"
}
```

### Get Single Order
```
GET /api/orders/:id
```

### Update Order Status (Admin)
```
PATCH /api/orders/:id/status
```
**Body:**
```json
{
  "status": "Processing"
}
```

---

## Reviews

### Get Product Reviews
```
GET /api/products/:productId/reviews
```
**Query Parameters:**
- `limit` (number) - Results per page (default: 10)
- `skip` (number) - Results to skip
- `rating` (number) - Filter by rating (1-5)

**Response:**
```json
{
  "reviews": [...],
  "total": 50,
  "averageRating": 4.5
}
```

### Create Review
```
POST /api/products/:productId/reviews
```
**Body:**
```json
{
  "rating": 5,
  "comment": "Great product!",
  "images": ["url1", "url2"]
}
```

### Update Review
```
PUT /api/reviews/:reviewId
```

### Delete Review
```
DELETE /api/reviews/:reviewId
```

---

## Authentication

### Register
```
POST /api/auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0123456789"
}
```

### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "jwt-token",
  "user": { /* user object */ }
}
```

### Logout
```
POST /api/auth/logout
```

### Get Current User
```
GET /api/auth/me
```
**Headers:** `Authorization: Bearer <token>`

---

## Users

### Get User Profile
```
GET /api/users/:id
```

### Update User Profile
```
PUT /api/users/:id
PATCH /api/users/:id
```
**Body:** User data (full or partial)

### Change Password
```
POST /api/users/:id/change-password
```
**Body:**
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

### Reset Password Request
```
POST /api/password/forgot
```
**Body:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password
```
POST /api/password/reset
```
**Body:**
```json
{
  "token": "reset-token",
  "newPassword": "new-password"
}
```

---

## Data Models

### Product Schema
```javascript
{
  _id: String,
  name: String,
  slug: String,
  description: String,
  categoryId: Array<Category>,
  brand: String,
  minPrice: Number,          // Minimum variant price
  maxPrice: Number,          // Maximum variant price
  imageUrls: Array<String>,
  averageRating: Number,
  status: String,            // 'Published', 'Draft', 'Out of Stock'
  isFeatured: Boolean,
  totalUnitsSold: Number,
  createdAt: Date,
  attributes: [              // Variant attribute definitions
    {
      name: String,          // e.g., 'Color', 'Size', 'Material'
      values: Array<String>  // e.g., ['Red', 'Blue', 'Green']
    }
  ],
  variants: Array<String>    // Array of variant IDs
}
```

### Variant Schema
```javascript
{
  _id: String,
  productId: String,
  sku: String,               // Unique SKU
  attributes: [              // Selected attribute values for this variant
    {
      name: String,          // e.g., 'Color'
      value: String          // e.g., 'Red'
    }
  ],
  price: Number,
  stockQuantity: Number,
  weight: Number,            // In grams
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  imageUrls: Array<String>,  // Variant-specific images
  isActive: Boolean
}
```

### Cart Item Schema
```javascript
{
  _id: String,
  productId: String,
  variantId: String,         // Required for products with variants
  quantity: Number,
  product: Object,           // Populated product data (returned by API)
  variant: Object            // Populated variant data (returned by API)
}
```

### Order Schema
```javascript
{
  _id: String,
  orderNumber: String,
  userId: String,
  items: [
    {
      productId: String,
      variantId: String,
      quantity: Number,
      price: Number,
      product: Object,
      variant: Object
    }
  ],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    district: String,
    ward: String
  },
  subtotal: Number,
  shippingFee: Number,
  discount: Number,
  total: Number,
  status: String,            // 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  paymentMethod: String,     // 'COD', 'Card', 'Bank Transfer'
  paymentStatus: String,     // 'Pending', 'Paid', 'Failed'
  createdAt: Date,
  updatedAt: Date
}
```

---

## Notes for Backend Implementation

### Variant System Requirements
1. **Product Attributes**: Products must define available attributes (e.g., Color, Size, Material) with their possible values
2. **Variant Matching**: Each variant combines specific attribute values (e.g., Color: Red + Size: Large)
3. **Stock Management**: Each variant has independent stock tracking
4. **Price Range**: Product's minPrice/maxPrice should be calculated from active variants
5. **Cart Integration**: Cart items must store both productId and variantId

### Important Implementation Details
1. **Population**: Cart and Order endpoints must populate product and variant data, not just return IDs
2. **Stock Validation**: Validate variant stock before adding to cart or creating orders
3. **Active Variants**: Only show variants where `isActive: true` and `stockQuantity > 0`
4. **SKU Uniqueness**: Ensure SKUs are unique across all variants
5. **Attribute Validation**: Verify variant attributes match product's defined attributes

### MSW Mock Data
- Mock data is available in `src/mocks/` directory
- 8 products with 20+ variants (2-3 variants per product)
- All mock handlers are in `src/mocks/handlers.js`
- Mock data matches the schemas defined above
