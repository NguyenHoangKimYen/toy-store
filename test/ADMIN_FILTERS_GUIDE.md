# Admin Panel Filtering Guide

## Overview

Comprehensive filtering logic has been added to both the **Products** and **Users** admin pages, allowing administrators to efficiently find and manage data with multiple filter criteria.

---

## Products Admin Filtering

### Available Filters

#### 1. **Status Filter**
- **Options**: All Statuses, Published, Draft, Archived
- **Use Case**: View only published products for customers, or see drafts/archived items for management
- **API Parameter**: `status`

#### 2. **Category Filter**
- **Options**: All Categories + Dynamic list from database
- **Use Case**: Filter products by category (e.g., Plush Toys, Keychains, Figures)
- **API Parameter**: `categoryId`

#### 3. **Featured Filter**
- **Options**: All Products, Featured Only, Not Featured
- **Use Case**: Manage featured products for homepage display
- **API Parameter**: `isFeatured` (true/false)

#### 4. **Price Range**
- **Inputs**: Min Price, Max Price (numeric)
- **Use Case**: Find products within specific price ranges
- **API Parameters**: `minPrice`, `maxPrice`

#### 5. **Rating Filter**
- **Options**: Any Rating, 4+ Stars, 3+ Stars, 2+ Stars, 1+ Stars
- **Use Case**: Filter products by minimum customer rating
- **API Parameter**: `minRating`

#### 6. **Date Range Filter**
- **Options**: Any Time, Last 7/30/90/180/365 Days
- **Use Case**: Find recently added products or products added in specific timeframes
- **API Parameter**: `daysAgo`

#### 7. **Sort Options**
- **Newest First**: `createdAt:desc` (default)
- **Oldest First**: `createdAt:asc`
- **Name (A-Z)**: `name:asc`
- **Name (Z-A)**: `name:desc`
- **Price (Low to High)**: `minPrice:asc`
- **Price (High to Low)**: `minPrice:desc`
- **Highest Rated**: `averageRating:desc`
- **Most Sold**: `totalUnitsSold:desc`
- **API Parameter**: `sort`

### How to Use

1. Click **"Show Filters"** button to expand the filter panel
2. Select your desired filter criteria
3. Filters apply automatically as you change them
4. Active filters are displayed as badges below the filter panel
5. Click **"Clear All Filters"** to reset everything

### Example Use Cases

**Find all draft products created in the last 7 days:**
- Status: Draft
- Date: Last 7 Days

**Find featured products under $20:**
- Featured: Featured Only
- Max Price: 20
- Sort: Price (Low to High)

**Find highly-rated plush toys:**
- Category: Plush Toys
- Min Rating: 4+ Stars
- Sort: Highest Rated

---

## Users Admin Filtering

### Available Filters

#### 1. **Role Filter**
- **Options**: All Roles, Customer, Admin
- **Use Case**: View only admin users or only customers
- **API Parameter**: `role`

#### 2. **Verification Status**
- **Options**: All Users, Verified Only, Unverified Only
- **Use Case**: Find users who haven't verified their email
- **API Parameter**: `isVerified` (true/false)

#### 3. **Login Method (Social Provider)**
- **Options**: All Methods, Email/Password, Google, Facebook
- **Use Case**: See which users signed up via social login vs email
- **API Parameter**: `socialProvider` (local/google/facebook)

### How to Use

1. Click **"Show Filters"** button to expand the filter panel
2. Select your desired filter criteria
3. Filters apply automatically as you change them
4. Active filters are displayed as badges below the filter panel
5. Use the search bar to search by name, username, email, or phone
6. Click **"Clear All Filters"** to reset everything

### Example Use Cases

**Find all unverified customers:**
- Role: Customer
- Verification Status: Unverified Only

**Find admin users:**
- Role: Admin

**Find Google sign-up users:**
- Login Method: Google

---

## Technical Architecture

### Component Structure

```
AdminPanel/
├── Products/
│   ├── components/
│   │   ├── ProductFilters.jsx      # NEW: Filter UI component
│   │   ├── ProductGrid.jsx
│   │   ├── ProductStats.jsx
│   │   └── ...
│   └── index.jsx                   # Enhanced with filter state
└── Users/
    ├── components/
    │   ├── UserFilters.jsx         # NEW: Filter UI component
    │   ├── UserTable.jsx
    │   ├── UserStats.jsx
    │   └── ...
    └── index.jsx                   # Enhanced with filter state
```

### Data Flow

1. **User interacts with filter UI** → Changes filter state
2. **Filter state changes** → Triggers API params update (via `useMemo`)
3. **API params update** → Triggers hook refetch (via `dependencies`)
4. **Hook fetches from backend** → With proper query parameters
5. **Backend filters data** → Returns filtered results
6. **UI updates** → Displays filtered data

### Hook Updates

#### `useProducts` Hook
- Now accepts `params` object with all backend filter parameters
- Supports `dependencies` array for triggering refetch
- Full parameter documentation in JSDoc

#### `useUsers` Hook  
- Now accepts `params` object for filtering (role, isVerified, socialProvider)
- Maintains backwards compatibility with `searchQuery` prop
- Supports `dependencies` array for triggering refetch

### Backend API Support

All filters map directly to backend API endpoints:

**Products API** (`GET /api/products`):
- `keyword` - Search in name/slug
- `categoryId` - Filter by category
- `minPrice`, `maxPrice` - Price range
- `minRating` - Minimum rating
- `isFeatured` - Featured flag
- `status` - Published/Draft/Archived
- `daysAgo` - Recent products
- `sort` - Sort field:direction
- `page`, `limit` - Pagination

**Users API** (`GET /api/users`):
- `role` - customer/admin
- `search` - Search keyword
- `page`, `limit` - Pagination
- Note: `isVerified` and `socialProvider` filters may need backend implementation

---

## Performance Considerations

### Hybrid Filtering Strategy

The implementation uses a **hybrid approach**:

1. **Server-side filtering**: All filter dropdowns (status, category, role, etc.) send requests to backend
2. **Client-side search**: Search bar filters locally for instant feedback
3. **Debouncing**: 500ms delay on search to avoid excessive API calls

### Benefits

- **Fast UI response**: Search feels instant
- **Reduced API calls**: Filters only trigger when necessary
- **Better UX**: Active filter badges show applied filters at a glance
- **Scalability**: Backend handles heavy filtering logic

---

## UI/UX Features

### Collapsible Filter Panel
- Toggle button shows/hides filters
- Badge indicator shows when filters are active
- Saves screen space when not needed

### Active Filter Badges
- Visual chips show which filters are currently applied
- Color-coded by filter type
- Helps users understand current view

### Clear All Filters
- One-click reset to default state
- Visible only when filters are active
- Also clears search query

### Responsive Design
- Grid layout adapts to screen size
- Mobile-friendly with stacked filters
- Touch-optimized controls

---

## Future Enhancements

### Potential Additions

1. **URL State Management**: Persist filters in URL for bookmarking/sharing
2. **Saved Filter Presets**: Allow admins to save common filter combinations
3. **Bulk Actions**: Apply actions to filtered results
4. **Export Filtered Data**: Download CSV/Excel of filtered products/users
5. **Advanced Search**: Multi-field search with operators (AND/OR)
6. **Filter History**: Quick access to recently used filters

### Backend Requirements

Some filters may require backend implementation:
- `isVerified` filtering in users endpoint
- `socialProvider` filtering in users endpoint
- Additional sort fields

---

## Troubleshooting

### Filters not working?

1. **Check browser console** for API errors
2. **Verify backend endpoint** supports the filter parameter
3. **Check network tab** to see actual API requests
4. **Test backend directly** with curl/Postman

### No results showing?

1. **Check if filters are too restrictive** (e.g., Draft products with Featured=true)
2. **Clear all filters** and try one at a time
3. **Check backend data** - may not have matching records

### Performance issues?

1. **Reduce result limit** if loading too many products
2. **Add more specific filters** to narrow results
3. **Check backend query performance** if slow

---

## Code Examples

### Using Filters Programmatically

```javascript
// Set filters from code
setFilters({
  status: 'Published',
  categoryId: 'some-category-id',
  minPrice: '10',
  maxPrice: '50',
  sort: 'minPrice:asc'
})

// Clear specific filter
setFilters(prev => ({ ...prev, status: 'all' }))

// Get active filter count
const activeFilterCount = Object.values(filters)
  .filter(v => v && v !== 'all' && v !== '').length
```

### Extending Filter Options

```javascript
// Add new filter in ProductFilters.jsx
<Select value={filters.brand || 'all'} 
        onValueChange={(v) => handleChange('brand', v)}>
  <SelectTrigger>
    <SelectValue placeholder='All Brands' />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value='all'>All Brands</SelectItem>
    <SelectItem value='brand1'>Brand 1</SelectItem>
    <SelectItem value='brand2'>Brand 2</SelectItem>
  </SelectContent>
</Select>

// Add to parent component filter state
const [filters, setFilters] = useState({
  // ... existing filters
  brand: 'all'  // NEW
})

// Hook will automatically pass it to backend
```

---

## Summary

The new filtering system provides powerful, user-friendly tools for managing products and users in the admin panel. With comprehensive filter options, visual feedback, and optimized performance, administrators can efficiently find and manage data at scale.

**Key Benefits:**
- ✅ Multiple filter criteria for precise data selection
- ✅ Collapsible UI saves screen space
- ✅ Visual badges show active filters
- ✅ Backend-powered filtering for scalability
- ✅ Client-side search for instant feedback
- ✅ Responsive design for all devices
- ✅ One-click clear all filters

For questions or feature requests, refer to the codebase or consult the development team.
