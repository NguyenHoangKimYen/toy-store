import { createContext, useContext } from 'react';
import { useCart as useCartHook } from '@/hooks/useCart';

// Create Cart Context
export const CartContext = createContext(null);

/**
 * Cart Provider - Wraps the app to provide global cart state
 * This ensures all components share the same cart state
 */
export const CartProvider = ({ children }) => {
  const cartState = useCartHook();

  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * Hook to access cart context
 * Use this instead of useCart directly to get shared state
 */
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

export default CartProvider;
