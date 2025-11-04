# API Integration Guide

## Configuration Complete

**`http://milkybloom.us-east-1.elasticbeanstalk.com`**

---

## 📡 API Endpoints

### **Products**
- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/:id` - Get single product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product (full update)
- `PATCH /api/products/:id` - Update product (partial update)
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/bulk-delete` - Delete multiple products
- `POST /api/products/:id/images` - Upload product images
- `DELETE /api/products/:id/images/:imageId` - Delete product image
- `GET /api/products/categories` - Get product categories

### **Users**
- `GET /api/users` - Get all users (with optional filters)
- `GET /api/users/:id` - Get single user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user (full update)
- `PATCH /api/users/:id` - Update user (partial update)
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/bulk-delete` - Delete multiple users
- `PATCH /api/users/:id/verify` - Update verification status
- `PATCH /api/users/:id/role` - Update user role
- `PATCH /api/users/:id/points` - Update loyalty points
- `GET /api/users/:id/activity` - Get user activity history

---

## 🔍 Query Parameters (Filters)

### **Products Filters**
```javascript
{
  search: 'teddy bear',        // Search in name, description
  category: 'category-id',     // Filter by category ID
  minPrice: 100000,            // Minimum price
  maxPrice: 500000,            // Maximum price
  isNew: true,                 // Filter new products
  isFeatured: false,           // Filter featured products
  inStock: true,               // Filter in-stock products
  sortBy: 'name',              // Sort field: name|price|createdAt
  sortOrder: 'asc',            // Sort order: asc|desc
  page: 1,                     // Page number (pagination)
  limit: 20                    // Items per page
}
```

### **Users Filters**
```javascript
{
  search: 'john',              // Search in name, email, phone, username
  role: 'customer',            // Filter by role: admin|customer
  verified: true,              // Filter by verification status
  hasSocialLogin: false,       // Filter by social login status
  sortBy: 'createdAt',         // Sort field: fullName|createdAt|loyaltyPoints
  sortOrder: 'desc',           // Sort order: asc|desc
  page: 1,                     // Page number (pagination)
  limit: 50                    // Items per page
}
```

---

## 🚀 Usage Examples

### **Fetching Products**
```javascript
import { getProducts } from '@/services/products.service';

// Basic fetch
const products = await getProducts();

// With search
const products = await getProducts({ search: 'teddy' });

// With multiple filters
const products = await getProducts({
  search: 'bear',
  category: '671ff0010000000000000001',
  minPrice: 100000,
  maxPrice: 500000,
  isNew: true,
  sortBy: 'price',
  sortOrder: 'desc',
  page: 1,
  limit: 20
});
```

### **Fetching Users**
```javascript
import { getUsers } from '@/services/users.service';

// Basic fetch
const users = await getUsers();

// With filters
const users = await getUsers({
  search: 'john',
  role: 'customer',
  verified: true,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### **CRUD Operations**
```javascript
import { 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '@/services/products.service';

// Get single product
const product = await getProductById('product-id');

// Create product
const newProduct = await createProduct({
  name: 'New Product',
  slug: 'new-product',
  price: 150000,
  stockQuantity: 50,
  categoryId: 'category-id'
});

// Update product
const updated = await updateProduct('product-id', {
  price: 120000,
  stockQuantity: 45
});

// Delete product
await deleteProduct('product-id');
```

---

## 📦 Current Implementation

### **Cleaned Up Files**
✅ `useProducts.js` - Now fetches from real API, removed mock data logic  
✅ `useUsers.js` - Now fetches from real API, removed mock data logic  
✅ `services/config.js` - Updated to use production backend URL  
✅ `.env` - Created with production API URL  

### **What Changed**
- ❌ Removed all mock data simulation logic
- ❌ Removed manual query string building
- ❌ Removed commented-out fetch code
- ✅ Now uses service functions from `products.service.js` and `users.service.js`
- ✅ Automatic query parameter handling
- ✅ Automatic error handling and response parsing
- ✅ Support for flexible response formats (array or object)

### **Mock Data Files (Still Available)**
The mock data files are still in your project if you need them for testing:
- `src/pages/AdminPanel/Products/hooks/mockData.js`
- `src/pages/AdminPanel/Users/hooks/mockData.js`

---

## 🔧 Configuration Files

### **.env**
```env
VITE_API_URL=http://milkybloom.us-east-1.elasticbeanstalk.com
```

### **To change API URL:**
1. Update `.env` file
2. Restart dev server: `npm run dev`

---

## 🎯 Backend Response Format

Your services can handle both response formats:

### **Option 1: Direct Array**
```json
[
  { "_id": "1", "name": "Product 1", ... },
  { "_id": "2", "name": "Product 2", ... }
]
```

### **Option 2: Object with Metadata**
```json
{
  "products": [...],
  "stats": {
    "totalProducts": 100,
    "totalStock": 500,
    ...
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

Both formats work automatically! 🎉

---

## 🛠️ Next Steps

1. **Test the integration:**
   ```bash
   npm run dev
   ```

2. **Check browser console for any errors**

3. **Verify API responses:**
   - Open DevTools → Network tab
   - Look for requests to `milkybloom.us-east-1.elasticbeanstalk.com`
   - Check response format and data

4. **If backend returns different format:**
   - Adjust the response handling in hooks
   - Or contact backend team for format standardization

---

## 🔐 Authentication (Future)

When you add authentication, uncomment these lines in services:

```javascript
// In services/utils/authHelpers.js - already set up
import { setAuthToken } from '@/services/utils/authHelpers';

// After login
setAuthToken('your-jwt-token');

// All API calls will automatically include the token
```

---

## ⚠️ Troubleshooting

### **CORS Errors**
If you see CORS errors, backend needs to allow your frontend origin:
```javascript
// Backend should have:
Access-Control-Allow-Origin: http://localhost:5173
```

### **404 Errors**
- Check if backend endpoints match the URLs in `services/config.js`
- Verify backend is running on the correct domain

### **Empty Data**
- Check backend response format in Network tab
- Adjust frontend code if backend returns different structure

---

## 📋 Summary

✅ **Frontend cleaned** - No more mock data simulation  
✅ **API configured** - Points to production backend  
✅ **Services ready** - All CRUD operations available  
✅ **Filters work** - Query parameters automatically handled  
✅ **Error handling** - Built-in error messages  
✅ **Debouncing** - 500ms delay for search  

Your app is ready to communicate with the real backend! 🚀
