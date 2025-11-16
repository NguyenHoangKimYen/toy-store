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
  const [discountInfo, setDiscountInfo] = useState({
    appliedCode: null,
    discountAmount: 0,
    isApplied: false,
  });

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => {
      if (!item.product) return sum;
      // Use variant price if available, otherwise use product price
      let price = 0;
      if (item.variant?.price) {
        price = typeof item.variant.price === 'object' 
          ? parseFloat(item.variant.price.$numberDecimal || item.variant.price) 
          : parseFloat(item.variant.price);
      } else if (item.product.minPrice) {
        price = typeof item.product.minPrice === 'object'
          ? parseFloat(item.product.minPrice.$numberDecimal || item.product.minPrice)
          : parseFloat(item.product.minPrice);
      } else if (item.product.price) {
        price = typeof item.product.price === 'object'
          ? parseFloat(item.product.price.$numberDecimal || item.product.price)
          : parseFloat(item.product.price);
      }
      
      const itemTotal = price * (item.quantity || 0);
      console.log('Price calculation:', { 
        productName: item.product?.name,
        rawVariantPrice: item.variant?.price,
        extractedPrice: price,
        quantity: item.quantity,
        itemTotal 
      });
      return sum + itemTotal;
    },
    0
  );
  const shipping = subtotal > 1000000 ? 0 : 50000; // Free shipping over 1,000,000 VND
  const tax = subtotal * 0.1; // 10% tax
  const discount = discountInfo.discountAmount || 0;
  const total = subtotal + shipping + tax - discount;

  console.log('Checkout totals:', { subtotal, shipping, tax, total, cartItemsCount: cartItems.length });

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
        items: cartItems.map((item) => {
          let price = 0;
          if (item.variant?.price) {
            price = typeof item.variant.price === 'object' 
              ? parseFloat(item.variant.price.$numberDecimal || item.variant.price) 
              : parseFloat(item.variant.price);
          } else if (item.product.minPrice) {
            price = typeof item.product.minPrice === 'object'
              ? parseFloat(item.product.minPrice.$numberDecimal || item.product.minPrice)
              : parseFloat(item.product.minPrice);
          } else if (item.product.price) {
            price = typeof item.product.price === 'object'
              ? parseFloat(item.product.price.$numberDecimal || item.product.price)
              : parseFloat(item.product.price);
          }
          
          return {
            productId: item.product._id,
            variantId: item.variantId,
            quantity: item.quantity || 0,
            price: price,
          };
        }),
        shippingInfo,
        paymentMethod,
        subtotal,
        shipping,
        tax,
        discount: discountInfo.discountAmount || 0,
        discountCode: discountInfo.appliedCode?.code || null,
        total,
      };

      // Submit order
      const order = await createOrder(orderData);

      // Mark discount code as used if applicable
      if (discountInfo.appliedCode && discountInfo.appliedCode._id) {
        try {
          const { useDiscountCode: applyDiscountCode } = await import('@/services/discountCodes.service');
          await applyDiscountCode(discountInfo.appliedCode._id);
        } catch (err) {
          console.error('Error marking discount code as used:', err);
          // Don't fail the order if marking fails
        }
      }

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

  const handleDiscountApplied = (info) => {
    setDiscountInfo(info);
  };

  return {
    cartItems,
    shippingInfo,
    paymentMethod,
    subtotal,
    shipping,
    tax,
    discount: discountInfo.discountAmount || 0,
    total,
    loading,
    error,
    submitting,
    handleShippingChange,
    handlePaymentMethodChange,
    handleSubmitOrder,
    handleDiscountApplied,
  };
};
