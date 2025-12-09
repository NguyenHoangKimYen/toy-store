# 🏠 Home Page (Landing Page)

Beautiful Nike-inspired landing page with premium product showcases.

## 📁 Structure

```
src/pages/Home/
├── components/
│   ├── HeroSection.jsx          # Carousel hero section (slider_3)
│   ├── HeroSection.css          # Hero styling with animations
│   ├── CategorySection.jsx      # Reusable product grid section
│   ├── CategorySection.css      # Product card styling
│   ├── FeaturedBanner.jsx       # Info banner with icons
│   ├── FeaturedBanner.css       # Banner styling
│   └── index.js                 # Barrel exports
├── hooks/
│   └── useProductsByCategory.js # Custom hook to fetch products
├── Home.css                     # Page-level styling
└── README.md                    # This file
```

## ✨ Features

### 🎠 **Hero Section (Carousel)**
- Full-screen carousel using slider_3 design
- 6 hero slides with smooth transitions
- Auto-play every 5 seconds
- GPU-accelerated animations
- Responsive design

### 📦 **Product Categories**
1. **New Arrivals** - Fresh drops with `isNew` flag
2. **Best Sellers** - Popular items with `isBestSeller` flag
3. **Móc Khóa (Keychains)** - Filtered by category name
4. **Gấu Bông (Plush Toys)** - Soft toys category
5. **Figures & Collectibles** - Premium collectibles
6. **Phụ Kiện (Accessories)** - Additional items

### 🎨 **Design Elements**
- Nike-inspired clean layout
- Smooth hover animations
- Product cards with quick view overlay
- Gradient backgrounds
- Responsive grid system
- Loading and error states

## 🎯 Performance Optimizations

### CSS
- `will-change` for animated properties
- `contain: layout style paint` for isolation
- `backface-visibility: hidden` for GPU acceleration
- `translateZ(0)` for hardware acceleration
- Lazy loading images

### JavaScript
- Pure vanilla JS for carousel (no React re-renders)
- Single render, then DOM manipulation
- Event delegation
- Cleanup on unmount

## 📱 Responsive Breakpoints

- **Desktop**: > 1200px - 4 columns
- **Tablet**: 768px - 991px - 3 columns
- **Mobile**: 480px - 767px - 2 columns
- **Small**: < 480px - 2 columns

## 🔧 Usage

```jsx
import Home from './pages/Home';

// The page automatically:
// 1. Fetches products from API
// 2. Categorizes them
// 3. Displays in beautiful sections
// 4. Handles loading/error states
```

## 🎨 Color Palette

- Primary Blue: `#3b82f6`
- Dark Blue: `#2563eb`
- Dark Text: `#1e293b`
- Gray Text: `#64748b`
- Light Gray: `#94a3b8`
- Background: `#f8fafc`

## 🚀 Key Components

### HeroSection
```jsx
<HeroSection />
// Auto-playing carousel with 6 slides
// Pure vanilla JS performance
```

### CategorySection
```jsx
<CategorySection
  title="New Arrivals"
  subtitle="Fresh drops you'll love"
  products={products}
  viewAllLink="/products?filter=new"
/>
```

### FeaturedBanner
```jsx
<FeaturedBanner />
// Info banner with 3 features
```

## 🔥 Features Highlights

1. **Smooth Animations** - GPU-accelerated CSS transitions
2. **Zero Re-renders** - Vanilla JS carousel
3. **Quick View** - Hover overlay on products
4. **Smart Loading** - Shows up to 8 products per category
5. **Fallback UI** - Loading spinner and error states
6. **SEO Ready** - Semantic HTML structure
7. **Accessible** - ARIA labels and keyboard navigation

## 📊 Data Flow

```
useProductsByCategory Hook
    ↓
Fetch all products from API
    ↓
Filter by category/flags
    ↓
Group into categories
    ↓
Pass to CategorySection components
    ↓
Render product cards
```

## 🎭 Animation Details

- **Hero Carousel**: Blur + scale transforms
- **Product Cards**: Translate Y + shadow
- **Buttons**: Scale + shadow
- **Images**: Scale on hover
- **Text**: Fade in with blur

## 🛠 Customization

### Add New Category
```javascript
// In useProductsByCategory.js
customCategory: allProducts.filter(p => 
  p.categoryId?.name?.toLowerCase().includes('your-category')
).slice(0, 8)

// In Home.jsx
<CategorySection
  title="Your Category"
  subtitle="Description"
  products={categorizedProducts.customCategory}
  viewAllLink="/products?category=custom"
/>
```

### Change Hero Slides
Edit `heroSlides` array in `HeroSection.jsx`

### Modify Grid Layout
Edit `.products-grid` in `CategorySection.css`

---

Built with ❤️ for premium e-commerce experience
