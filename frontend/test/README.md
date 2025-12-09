# 🛍️ ECM E-commerce Frontend

A modern, scalable e-commerce application built with React + Vite, featuring a comprehensive product catalog, shopping cart, checkout flow, and admin panel.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Documentation

### Essential Reading
- 📖 **[Project Structure](src/docs/PROJECT_STRUCTURE.md)** - Comprehensive architecture guide
- 📋 **[Maintenance Checklist](MAINTENANCE_CHECKLIST.md)** - Ongoing development guidelines
- 📊 **[Refactoring Summary](REFACTORING_SUMMARY.md)** - Recent improvements details
- 🎯 **[Executive Summary](EXECUTIVE_SUMMARY.md)** - High-level project overview

### Quick Links
- [Component Organization](#component-organization)
- [Development Guidelines](#development-guidelines)
- [Tech Stack](#tech-stack)
- [Features](#features)

## 🏗️ Project Structure

```
src/
├── assets/              # Static assets (images, icons)
├── components/          # Reusable UI components
│   ├── common/          # Common components (ProductCard, Pagination)
│   ├── shared/          # Shared specialized components
│   └── ui/              # shadcn/ui components
├── config/              # Application configuration
├── hooks/               # Custom React hooks (centralized)
├── mocks/               # MSW mock data and handlers
├── pages/               # Page components with feature logic
│   ├── AdminPanel/      # Admin dashboard
│   ├── Cart/            # Shopping cart
│   ├── Checkout/        # Checkout flow
│   ├── Home/            # Home page
│   ├── Products/        # Product catalog
│   └── Profile/         # User profile
├── routes/              # React Router configuration
├── services/            # API service layer
└── utils/               # Utility functions
```

## ✨ Features

### User Features
- 🛒 Product catalog with filtering, sorting, and search
- 🎯 Product detail pages with reviews
- 🛍️ Shopping cart management
- 💳 Checkout flow with shipping and payment
- 📦 Order history
- 👤 User profile management
- 🏷️ Category browsing
- ⭐ Product reviews and ratings

### Admin Features
- 📊 Admin dashboard
- 📦 Product management (CRUD)
- 👥 User management
- 📈 Analytics and reporting

### Technical Features
- 🎨 Modern UI with Tailwind CSS
- 🔄 MSW for development mocking
- 📱 Fully responsive design
- ♿ Accessibility considerations
- 🚀 Optimized build with Vite
- 🎯 Path aliases for clean imports

## 🛠️ Tech Stack

### Core
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Icon library

### State & Data
- **React Hooks** - State management
- **MSW** - API mocking
- **Fetch API** - HTTP requests

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Path Aliases** - Clean imports with @/

## 🎯 Component Organization

### Common Components (`src/components/common/`)
Reusable components used across multiple pages:
- `ProductCard` - Product display card (3 variants)
- `Pagination` - Page navigation
- `LoadingSpinner` - Loading states
- `ErrorMessage` - Error display
- `ProductBadges` - Product status badges

### Shared Components (`src/components/shared/`)
Specialized reusable components:
- `ProductCarousel` - Featured products carousel

### Usage Example
```javascript
import { ProductCard, Pagination } from '@/components/common';
import { ProductCarousel } from '@/components/shared';
```

## 🔧 Development Guidelines

### Before Creating New Code
1. ✅ Check for existing utilities/components
2. ✅ Review [PROJECT_STRUCTURE.md](src/docs/PROJECT_STRUCTURE.md)
3. ✅ Follow established naming conventions
4. ✅ Consider reusability

### Import Patterns
```javascript
// ✅ Correct - using path aliases
import { ProductCard } from '@/components/common';
import { formatPrice } from '@/utils';
import { getProducts } from '@/services';

// ❌ Incorrect - relative paths for shared code
import ProductCard from '../../../components/common/ProductCard';
```

### Adding New Features

#### New Page
```
src/pages/PageName/
├── index.jsx           # Main component
├── PageName.css        # Styles
├── components/         # Page-specific components
│   ├── Component.jsx
│   └── index.js
└── hooks/              # Page-specific hooks
    ├── useFeature.js
    └── index.js
```

#### New Common Component
1. Create in `src/components/common/ComponentName.jsx`
2. Add `ComponentName.css` for styles
3. Export in `src/components/common/index.js`
4. Add JSDoc documentation

### Code Quality Standards
- ✅ No duplicate code
- ✅ Use central utilities
- ✅ Keep components under 300 lines
- ✅ Write meaningful commit messages
- ✅ Follow established patterns

## 🌐 Environment Variables

```env
# .env.local
VITE_USE_MOCK_DATA=true           # Enable MSW for development
VITE_API_URL=http://localhost:3000  # Backend API URL
```

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🧪 Testing

Testing infrastructure to be implemented. See [MAINTENANCE_CHECKLIST.md](MAINTENANCE_CHECKLIST.md) for testing roadmap.

## 📈 Performance

### Current Metrics
- **Bundle Size**: ~479 KB (gzipped)
- **Build Time**: ~11.8s
- **Lighthouse Score**: TBD

### Optimization Opportunities
See [MAINTENANCE_CHECKLIST.md](MAINTENANCE_CHECKLIST.md) for detailed optimization plan.

## ♿ Accessibility

Working towards WCAG 2.1 AA compliance. See [MAINTENANCE_CHECKLIST.md](MAINTENANCE_CHECKLIST.md) for accessibility checklist.

## 🔐 Security

- Regular dependency audits
- XSS protection
- Secure authentication handling
- See [MAINTENANCE_CHECKLIST.md](MAINTENANCE_CHECKLIST.md) for security guidelines

## 🤝 Contributing

### Workflow
1. Create feature branch (`feature/feature-name`)
2. Follow development guidelines
3. Write meaningful commits
4. Submit pull request

### Commit Message Format
```
type(scope): subject

Types: feat, fix, refactor, docs, test, chore, style, perf
```

## 📝 Recent Updates

### November 16, 2025 - Major Refactoring
- ✅ Fixed critical import errors
- ✅ Removed duplicate components and utilities
- ✅ Established clear architectural patterns
- ✅ Created comprehensive documentation
- See [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) for details

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Import Errors
- Check path aliases in `vite.config.js`
- Verify barrel exports in `index.js` files

### Style Conflicts
- Check for CSS specificity issues
- Review component variant props

## 📞 Support

For questions or issues:
1. Check [PROJECT_STRUCTURE.md](src/docs/PROJECT_STRUCTURE.md)
2. Review [MAINTENANCE_CHECKLIST.md](MAINTENANCE_CHECKLIST.md)
3. See [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)

## 📄 License

[Add your license here]

## 👥 Team

[Add team members here]

---

**Last Updated**: November 16, 2025  
**Status**: ✅ Production Ready  
**Version**: 1.0.0
