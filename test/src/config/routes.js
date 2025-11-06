// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  COLLECTION: '/collection',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  ABOUT: '/about',
  CONTACT: '/contact',
  CART: '/cart',
  PLACE_ORDER: '/place-order',
  ORDERS: '/orders',
};

// Admin routes
export const ADMIN_ROUTES = {
  BASE: '/admin',
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  PRODUCTS: '/admin/products',
  ORDERS: '/admin/orders',
  SETTINGS: '/admin/settings',
};

// Backward compatibility
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ADMIN: ADMIN_ROUTES.BASE,
  ADMIN_USERS: ADMIN_ROUTES.USERS,
  ADMIN_PRODUCTS: ADMIN_ROUTES.PRODUCTS,
};
