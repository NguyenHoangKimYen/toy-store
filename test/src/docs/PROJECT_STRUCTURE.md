# Project Structure and Architecture

## Overview
This is a React-based e-commerce application built with Vite, featuring a comprehensive product catalog, shopping cart, checkout, and admin panel.

## Directory Structure

```
src/
├── assets/              # Static assets (images, icons)
├── components/          # Reusable UI components
│   ├── common/          # Common components (ProductCard, Pagination, etc.)
│   ├── shared/          # Shared specialized components (ProductCarousel)
│   └── ui/              # shadcn/ui components
├── config/              # Application configuration
├── hooks/               # Custom React hooks (centralized)
├── mocks/               # MSW mock data and handlers
├── pages/               # Page components with feature-specific logic
│   ├── AdminPanel/      # Admin dashboard pages
│   ├── Cart/            # Shopping cart page
│   ├── Checkout/        # Checkout flow pages
│   ├── Home/            # Home page with sections
│   ├── OrderHistory/    # Order history page
│   ├── Products/        # Product catalog and detail pages
│   └── Profile/         # User profile page
├── routes/              # React Router configuration
├── services/            # API service layer
└── utils/               # Utility functions (formatters, helpers)
```

## Architecture Principles

### 1. Component Organization

#### Common Components (`src/components/common/`)
- **Purpose**: Reusable components used across multiple pages
- **Examples**: `ProductCard`, `Pagination`, `LoadingSpinner`, `ErrorMessage`
- **Rules**:
  - Must be generic and configurable via props
  - Should not contain page-specific logic
  - Co-locate component CSS with the component file
  - Export via barrel file (`index.js`)

#### Shared Components (`src/components/shared/`)
- **Purpose**: Specialized reusable components with specific business logic
- **Examples**: `ProductCarousel`
- **Rules**:
  - More specialized than common components
  - Can contain complex business logic
  - Still reusable across multiple contexts

#### Page Components (`src/pages/`)
- **Purpose**: Page-level components with route-specific logic
- **Structure**:
  ```
  PageName/
  ├── index.jsx           # Main page component
  ├── PageName.css        # Page-specific styles
  ├── components/         # Page-specific components
  │   ├── ComponentA.jsx
  │   ├── ComponentA.css
  │   └── index.js        # Barrel export
  └── hooks/              # Page-specific hooks
      ├── usePageFeature.js
      └── index.js
  ```

### 2. Hooks Organization

#### Central Hooks (`src/hooks/`)
- **Purpose**: Application-wide reusable hooks
- **Examples**: `useProducts`, `useResponsive`, `useCarouselAutoplay`
- **Rules**:
  - Must be reusable across multiple pages
  - Should not contain page-specific logic
  - Export via barrel file for easy imports

#### Page-Specific Hooks
- **Location**: Within page directory (`src/pages/PageName/hooks/`)
- **Purpose**: Hooks specific to a page's functionality
- **Rules**:
  - Only used within that specific page
  - Can be promoted to central hooks if needed elsewhere

### 3. Services Layer

#### Structure
```
services/
├── config.js              # API endpoints and configuration
├── index.js               # Barrel export
├── products.service.js    # Product-related API calls
├── cart.service.js        # Cart-related API calls
├── orders.service.js      # Orders-related API calls
├── reviews.service.js     # Reviews-related API calls
└── users.service.js       # User-related API calls
```

#### Principles
- Each service file handles one domain
- All API calls should use utilities from `utils/apiHelpers`
- Authentication handled via `utils/authHelpers`
- Services export named functions for specific operations
- Barrel file provides both individual exports and grouped exports

### 4. Utilities (`src/utils/`)

#### Central Utilities
- `formatPrice.js` - Currency formatting (VND)
- `formatDate.js` - Date formatting
- `apiHelpers.js` - API request/response handling
- `authHelpers.js` - Authentication token management
- `cn.js` - Class name utility (for Tailwind)

#### Rules
- **NO DUPLICATION**: Always import from central utils
- Domain-specific utilities can exist in page folders but should re-export central utilities
- Example:
  ```javascript
  // In page-specific utils
  export { formatPrice, formatDate } from '@/utils';
  export const domainSpecificFormatter = () => { /* ... */ };
  ```

### 5. CSS Organization

#### Global Styles
- `index.css` - Global resets and base styles
- `App.css` - App-level layout styles

#### Component Styles
- Co-locate CSS with components: `ComponentName.css`
- Use BEM naming convention or scoped classes
- Avoid deep nesting and overly specific selectors

#### CSS Anti-Patterns to Avoid
❌ **Don't override common component styles in page-level CSS**
```css
/* BAD - in PageName.css */
.product-card {
  /* Overriding common component styles */
}
```

✅ **Do use props and variants for customization**
```jsx
// GOOD - in component
<ProductCard variant="compact" className="custom-class" />
```

✅ **Do use wrapper classes for page-specific layouts**
```css
/* GOOD - in PageName.css */
.page-product-grid {
  /* Layout styles specific to this page */
}

.page-product-grid .product-card {
  /* Only layout-related adjustments */
  margin: 10px;
}
```

### 6. Import Patterns

#### Path Aliases
```javascript
import { ProductCard } from '@/components/common';
import { useProducts } from '@/hooks';
import { getProducts } from '@/services';
import { formatPrice } from '@/utils';
```

#### Barrel Exports
- Use `index.js` files to group and export related modules
- Provides cleaner imports at the cost of slightly larger bundles
- Examples:
  ```javascript
  // components/common/index.js
  export { default as ProductCard } from './ProductCard';
  export { default as Pagination } from './Pagination';
  
  // Usage
  import { ProductCard, Pagination } from '@/components/common';
  ```

### 7. Mock Data (MSW)

#### Structure
```
mocks/
├── browser.js          # MSW worker setup
├── handlers.js         # Request handlers
├── index.js            # Barrel export
├── mockProducts.js     # Product mock data
└── mockReviews.js      # Review mock data
```

#### Usage
- Conditional setup in `main.jsx` via `VITE_USE_MOCK_DATA` env variable
- Handlers intercept API calls with `/api` prefix
- Comprehensive filtering, sorting, and pagination support

### 8. AdminPanel Structure

#### Special Considerations
- AdminPanel has its own component ecosystem
- Shares utilities from central `src/utils/`
- May have domain-specific formatters in local utils
- Should re-export central utilities where possible

## Best Practices

### Component Design
1. **Single Responsibility**: Each component should do one thing well
2. **Props Over State**: Prefer controlled components where possible
3. **Composition**: Build complex UIs from simple components
4. **Error Boundaries**: Handle errors gracefully

### Performance
1. **Code Splitting**: Use React.lazy for route-based splitting
2. **Memoization**: Use React.memo, useMemo, useCallback appropriately
3. **List Virtualization**: Consider for long lists
4. **Image Optimization**: Use appropriate formats and lazy loading

### Code Quality
1. **Consistent Naming**: Use camelCase for functions/variables, PascalCase for components
2. **Prop Types**: Consider adding PropTypes or TypeScript
3. **Documentation**: Add JSDoc comments for complex functions
4. **Testing**: Write tests for critical business logic

### Anti-Patterns to Avoid

❌ **Duplicate Components**
- Don't create similar components in different locations
- Extract common functionality to shared components

❌ **Duplicate Utilities**
- Don't recreate formatters or helpers
- Always check `src/utils/` first

❌ **Deep Prop Drilling**
- Use Context API or state management for deeply nested props
- Consider composition over excessive prop passing

❌ **Circular Dependencies**
- Avoid circular imports between modules
- Restructure if necessary

❌ **Massive Components**
- Break down components over 300 lines
- Extract sub-components and hooks

## Migration Notes

### Recent Refactoring (Current)
1. Fixed incorrect import path in `services/index.js`
2. Removed duplicate exports in `components/shared/index.js`
3. Consolidated formatters to use central utilities
4. Removed dead exports from `pages/Home/components/index.js`
5. Deleted unused `useCarousel.js` hook
6. Deleted duplicate `ProductBadges` in AdminPanel
7. Deleted duplicate mock data in AdminPanel
8. Updated AdminPanel components to use central utilities

### Technical Debt
1. Consider consolidating CSS overrides into variant props
2. Evaluate moving page-specific hooks to central location if reused
3. Consider implementing TypeScript for better type safety
4. Add PropTypes or similar validation
5. Implement comprehensive error boundaries

## File Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useProducts.js`)
- **Utilities**: camelCase (e.g., `formatPrice.js`)
- **CSS**: Match component name (e.g., `ProductCard.css`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Services**: camelCase with domain suffix (e.g., `products.service.js`)

## Adding New Features

### New Page
1. Create directory in `src/pages/PageName/`
2. Create `index.jsx` as main component
3. Add `PageName.css` for styles
4. Create `components/` folder for page-specific components
5. Create `hooks/` folder if needed
6. Add route in `src/routes/AppRoutes.jsx`
7. Export components via `components/index.js`

### New Common Component
1. Create in `src/components/common/ComponentName.jsx`
2. Add `ComponentName.css` for styles
3. Add JSDoc documentation
4. Export in `src/components/common/index.js`
5. Write tests (if applicable)

### New Service
1. Create `domain.service.js` in `src/services/`
2. Import utilities from `src/utils/`
3. Export named functions for operations
4. Add exports to `src/services/index.js`
5. Update service documentation

### New Utility
1. Create in `src/utils/utilityName.js`
2. Write pure, testable functions
3. Add JSDoc documentation
4. Export in `src/utils/index.js`
5. Write unit tests

## Environment Variables

```env
VITE_USE_MOCK_DATA=true          # Enable MSW for local development
VITE_API_URL=http://localhost:3000  # Backend API URL
```

## Troubleshooting

### Import Errors
- Check path aliases in `vite.config.js`
- Verify barrel exports in `index.js` files
- Ensure no circular dependencies

### Style Conflicts
- Check for CSS specificity issues
- Verify no duplicate class names
- Review component variant props

### Build Errors
- Clear node_modules and reinstall
- Check for missing dependencies
- Verify all imports are correct

## Contributing Guidelines

1. Follow the established patterns in this document
2. Don't duplicate code - always search first
3. Update this document when adding new patterns
4. Write self-documenting code with clear names
5. Add comments for complex logic only
6. Keep components small and focused
7. Test your changes thoroughly

---

**Last Updated**: November 16, 2025
**Version**: 1.0.0
