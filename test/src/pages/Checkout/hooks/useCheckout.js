import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createOrder } from '@/services/orders.service';
import { ROUTES } from '@/config/routes';

export const useCheckout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Mock cart items (in real app, this would come from cart context/state)
  const [cartItems, setCartItems] = useState([]);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => {
      if (!item.product) return sum;
      const price = item.product.minPrice || item.product.price?.$numberDecimal || item.product.price || 0;
      return sum + price * item.quantity;
    },
    0
  );
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  // Load cart items (mock implementation)
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setLoading(true);
        // Use cart service to get cart with product details
        const { getCart } = await import('@/services/cart.service');
        const cartData = await getCart();
        setCartItems(cartData);
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, []);

  const handleShippingChange = (newShippingInfo) => {
    setShippingInfo(newShippingInfo);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const validateShippingInfo = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
    for (const field of required) {
      if (!shippingInfo[field]) {
        throw new Error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      throw new Error('Please enter a valid email address');
    }
  };

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Validate shipping info
      validateShippingInfo();

      // Prepare order data
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.minPrice || item.product.price?.$numberDecimal || item.product.price,
        })),
        shippingInfo,
        paymentMethod,
        subtotal,
        shipping,
        tax,
        total,
      };

      // Submit order
      const order = await createOrder(orderData);

      // Clear cart
      localStorage.removeItem('cart');

      // Show success toast
      toast.success('Order placed successfully!', {
        description: `Order #${order._id.slice(-8)}`,
      });

      // Redirect to success page
      navigate(`${ROUTES.ORDERS}/${order._id}`, {
        state: { orderSuccess: true },
      });
    } catch (err) {
      console.error('Error submitting order:', err);
      const errorMessage = err.message || 'Failed to submit order. Please try again.';
      setError(errorMessage);
      toast.error('Order failed', {
        description: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    cartItems,
    shippingInfo,
    paymentMethod,
    subtotal,
    shipping,
    tax,
    total,
    loading,
    error,
    submitting,
    handleShippingChange,
    handlePaymentMethodChange,
    handleSubmitOrder,
  };
};
