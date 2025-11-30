// Shared hooks
export { useCarouselAutoplay } from './useCarouselAutoplay';
export { useCarouselNavigation } from './useCarouselNavigation';
export { useResponsive } from './useResponsive';
export { useDebounce } from './useDebounce';

// Product hooks - Universal and flexible
export { useProducts, useCategorizedProducts, useProductDetail } from './useProducts';

// Review hooks - Manage product reviews and user reviews
export { useReviews } from './useReviews';
export { useReviewPolling } from './useReviewPolling';

// Discount code hooks - Validate and manage discount codes
export { useDiscountCode, useDiscountCodes, useDiscountCodeDetails } from './useDiscountCode';

// Cart hooks - Add products to cart, manage cart state
export { useAddToCart } from './useAddToCart';
export { useCart } from './useCart';

// Order hooks - Order management and checkout
export { useOrders } from './useOrders';

// Category hooks - Manage categories
export { useCategories } from './useCategories';

// Auth hooks - Authentication and user context
export { useAuth } from './useAuth';

// User hooks - Use EVERYWHERE for user data (admin, profile, etc.)
export { useUsers, useUser, useUsersList } from './useUsers';
