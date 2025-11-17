# Admin Panel - Full CRUD Implementation

## Overview
The admin panel now has complete CRUD (Create, Read, Update, Delete) functionality for products with automatic mock/real API switching based on environment variables.

## Features Implemented

### 1. Environment-Based Data Source
- **Mock Data Mode**: When `VITE_USE_MOCK_DATA=true` in `.env`, uses localStorage for persistence
- **API Mode**: When `VITE_USE_MOCK_DATA=false`, connects to real backend API
- Automatically detects and displays current mode in UI

### 2. Full CRUD Operations

#### Create Product
- Click "Add Product" button in admin panel
- Fill in product details:
  - **Basic Info**: Name*, Description*, Brand, Stock Quantity
  - **Categories**: Add multiple categories with tags
  - **Images**: Add multiple image URLs
  - **Variants**: Color*, Size, Price*, Stock (at least one required)
  - **Flags**: Mark as New, Mark as Featured
- Form validation ensures required fields are filled
- Automatically calculates min/max prices from variants

#### Read Product
- View all products in grid layout
- Click on any product card to see detailed modal
- Search products by name, description, or brand
- See real-time stats: Total Products, Total Stock, Total Sold, Out of Stock

#### Update Product
- **From Grid**: Click Edit button on product card
- **From Detail Modal**: Click Edit button in modal header
- Opens pre-filled form with current product data
- Modify any field and save changes
- Changes persist in localStorage (mock) or database (API)

#### Delete Product
- **From Grid**: Click Delete button on product card
- **From Detail Modal**: Click Delete button in modal header
- Confirmation dialog prevents accidental deletion
- Removes product from storage/database

### 3. Product Form Features
- **Image Management**: Add/remove multiple product images with preview
- **Category Tags**: Dynamic category management with visual tags
- **Variant Management**: 
  - Add multiple variants (color, size, price, stock)
  - Remove variants individually
  - Visual variant list with all details
- **Real-time Validation**: Shows errors for required fields
- **Responsive Design**: Works on all screen sizes

### 4. Data Persistence
- **Mock Mode**: 
  - Stores products in `localStorage` under key `admin_mock_products`
  - Initialized with mock data on first load
  - Changes persist across page refreshes
- **API Mode**: 
  - Makes real HTTP requests to backend
  - Standard REST API endpoints

## Files Created/Modified

### New Files
1. **`src/hooks/useAdminProducts.js`**
   - Hook for admin product management
   - Handles mock/API switching
   - Provides CRUD operations: `createProduct`, `updateProduct`, `deleteProduct`, `bulkDeleteProducts`
   - Auto-loads products on mount

2. **`src/pages/AdminPanel/Products/components/ProductFormModal.jsx`**
   - Comprehensive product form for add/edit
   - Dynamic fields for categories, images, variants
   - Form validation
   - Preview functionality

### Modified Files
1. **`src/pages/AdminPanel/Products/index.jsx`**
   - Integrated `useAdminProducts` hook
   - Added create/edit/delete handlers
   - Shows mock/API mode in header

2. **`src/pages/AdminPanel/Products/components/ProductDetailModal.jsx`**
   - Added Edit and Delete buttons
   - Integrated ProductFormModal for editing
   - Confirmation for deletion

3. **`src/mocks/handlers.js`**
   - Added POST `/api/products` (create)
   - Added PUT `/api/products/:id` (update)
   - Added PATCH `/api/products/:id` (partial update)
   - Added DELETE `/api/products/:id` (delete)
   - Added POST `/api/products/bulk-delete` (bulk delete)

4. **`src/hooks/index.js`**
   - Exported `useAdminProducts` hook

## Usage

### Switch Between Mock and Real API
Edit `.env` file:
```env
# Use mock data
VITE_USE_MOCK_DATA=true

# Use real API
VITE_USE_MOCK_DATA=false
VITE_API_URL=http://your-api-url.com
```

### Add New Product
1. Navigate to Admin Panel > Products
2. Click "Add Product" button
3. Fill in all required fields (marked with *)
4. Add at least one image and one variant
5. Click "Create Product"

### Edit Product
1. Click Edit button on product card OR
2. Click product to open detail modal, then click Edit
3. Modify fields as needed
4. Click "Save Changes"

### Delete Product
1. Click Delete button on product card OR
2. Click product to open detail modal, then click Delete
3. Confirm deletion in dialog

## Product Data Structure
```javascript
{
  _id: "product_123",
  name: "Product Name",
  description: "Product description",
  brand: "Brand Name",
  stockQuantity: 100,
  isNew: true,
  isFeatured: false,
  imageUrls: ["url1", "url2"],
  categoryId: [
    { _id: "cat_1", name: "Category 1" }
  ],
  variants: [
    {
      _id: "var_1",
      color: "Red",
      size: "M",
      price: { $numberDecimal: "29.99" },
      stock: 50,
      isActive: true
    }
  ],
  minPrice: { $numberDecimal: "29.99" },
  maxPrice: { $numberDecimal: "39.99" },
  createdAt: "2025-11-17T...",
  updatedAt: "2025-11-17T...",
  soldCount: 0,
  averageRating: 0,
  totalReviews: 0
}
```

## Toast Notifications
All operations show toast notifications:
- ✅ Success: "Product created/updated/deleted successfully"
- ❌ Error: Detailed error message from API or validation

## Validation Rules
- **Name**: Required, non-empty string
- **Description**: Required, non-empty string
- **Images**: At least one image URL required
- **Variants**: At least one variant required
  - Each variant must have Color and Price
  - Size is optional
  - Stock defaults to 0

## Technical Details
- **State Management**: React useState, useCallback, useEffect
- **UI Components**: shadcn/ui (Button, Input, Badge)
- **Icons**: lucide-react
- **Notifications**: sonner (toast)
- **Storage**: localStorage (mock) or API (real)
- **Validation**: Client-side validation before submission

## Future Enhancements
- Bulk edit functionality
- Image upload to cloud storage
- Category management panel
- Variant bulk operations
- Product duplication
- Advanced filtering and sorting
- Export/import products (CSV, JSON)
- Product analytics and insights
