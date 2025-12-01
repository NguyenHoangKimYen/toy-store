import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrders, useAuth } from '@/hooks';
import { useCartContext } from '@/context/CartProvider';
import { ROUTES } from '@/config/routes';
import { payByCash, getShippingFeeByUser, getDeliveryTypes } from '@/services';

// Default delivery types (fallback)
const DEFAULT_DELIVERY_TYPES = [
  { id: 'economy', name: 'Economy Shipping', description: 'Delivered in 5-7 business days', estimatedDays: { min: 5, max: 7 }, available: true },
  { id: 'standard', name: 'Standard Shipping', description: 'Delivered in 3-5 business days', estimatedDays: { min: 3, max: 5 }, available: true },
  { id: 'express', name: 'Express Shipping', description: 'Delivered in 1-2 business days', estimatedDays: { min: 1, max: 2 }, available: true },
  { id: 'expedited', name: 'Expedited Shipping', description: 'Priority delivery with weather-adjusted fees', estimatedDays: { min: 0, max: 1 }, available: true },
];

export const useCheckout = () => {
  const navigate = useNavigate();
  const { cart, cartItems, cartSummary, loading: cartLoading, clearAllItems } = useCartContext();
  const { checkoutCart, loading: orderLoading } = useOrders();
  const { user } = useAuth();
  
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cashondelivery');
  const [deliveryType, setDeliveryType] = useState('standard');
  const [deliveryTypes, setDeliveryTypes] = useState(DEFAULT_DELIVERY_TYPES);
  const [discountInfo, setDiscountInfo] = useState({
    appliedCode: null,
    discountAmount: 0,
    isApplied: false,
  });
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  const [shippingData, setShippingData] = useState({
    fee: 0,
    fees: {}, // fees by delivery type
    weather: null,
    region: null,
  });
  const [shippingLoading, setShippingLoading] = useState(false);

  // Calculate totals
  const subtotal = cartSummary.subtotal;
  const discount = discountInfo.discountAmount || 0;
  const shippingFee = shippingData.fees[deliveryType] ?? shippingData.fee;
  const total = Math.max(0, subtotal + shippingFee - discount - loyaltyPointsUsed);

  const loading = cartLoading || orderLoading;

  // Fetch delivery types on mount
  useEffect(() => {
    const fetchDeliveryTypes = async () => {
      try {
        const response = await getDeliveryTypes();
        if (response.success && response.deliveryTypes) {
          setDeliveryTypes(response.deliveryTypes);
        }
      } catch (err) {
        console.error('Error fetching delivery types:', err);
        // Keep default delivery types on error
      }
    };

    fetchDeliveryTypes();
  }, []);

  // Fetch shipping fee from backend when subtotal or delivery type changes
  const fetchShippingFees = useCallback(async () => {
    if (subtotal === 0) {
      setShippingData({ fee: 0, fees: {}, weather: null, region: null });
      return;
    }

    try {
      setShippingLoading(true);
      
      if (user?._id) {
        // Fetch fees for all delivery types
        const allFees = {};
        let weatherData = null;
        let regionData = null;
        
        for (const type of deliveryTypes) {
          try {
            const response = await getShippingFeeByUser(user._id, {
              orderValue: subtotal,
              deliveryType: type.id,
            });
            
            if (response.success) {
              allFees[type.id] = response.fee || 0;
              
              // Capture region and weather from first successful response
              if (!regionData) {
                regionData = response.region;
                weatherData = response.weather;
              }
            }
          } catch (err) {
            console.error(`Error fetching fee for ${type.id}:`, err);
            allFees[type.id] = 50000; // Fallback
          }
        }
        
        setShippingData({
          fees: allFees,
          fee: allFees[deliveryType] || 0,
          region: regionData,
          weather: weatherData,
        });
      } else {
        // For guests, estimate based on threshold
        const estimatedFees = {};
        deliveryTypes.forEach(type => {
          if (subtotal >= 500000 && type.id !== 'expedited') {
            estimatedFees[type.id] = 0;
          } else if (subtotal >= 500000 && type.id === 'expedited') {
            estimatedFees[type.id] = Math.round(50000 * 0.7); // 30% off
          } else {
            const multipliers = { economy: 0.7, standard: 1, express: 1.5, expedited: 2 };
            estimatedFees[type.id] = Math.round(50000 * (multipliers[type.id] || 1));
          }
        });
        
        setShippingData({
          fee: estimatedFees[deliveryType] || 50000,
          fees: estimatedFees,
          weather: null,
          region: null,
        });
      }
    } catch (err) {
      console.error('Error fetching shipping fee:', err);
      setShippingData({
        fee: subtotal >= 500000 ? 0 : 50000,
        fees: {},
        weather: null,
        region: null,
      });
    } finally {
      setShippingLoading(false);
    }
  }, [subtotal, user, deliveryTypes, deliveryType]);

  useEffect(() => {
    fetchShippingFees();
  }, [fetchShippingFees]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleDeliveryTypeChange = (type) => {
    setDeliveryType(type);
  };

  const handleSubmitOrder = async (addressId) => {
    // Handle both addressId (string) and address object (for guests)
    const isGuestAddress = typeof addressId === 'object';
    
    if (!addressId) {
      toast.error('Please select a delivery address');
      return;
    }

    const cartId = cart?._id || cart?.id;
    if (!cartId) {
      toast.error('Cart not found');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Prepare checkout data
      let checkoutData;
      
      if (isGuestAddress) {
        const sessionId = localStorage.getItem('guestSessionId');
        checkoutData = {
          sessionId,
          guestInfo: {
            fullName: addressId.fullNameOfReceiver,
            email: addressId.email || '',
            phone: addressId.phone,
            addressLine: addressId.addressLine,
            lat: addressId.lat || null,
            lng: addressId.lng || null,
          },
          paymentMethod,
          deliveryType,
          discountCodeId: discountInfo.appliedCode?.id || null,
          pointsToUse: loyaltyPointsUsed,
        };
      } else {
        checkoutData = {
          addressId,
          paymentMethod,
          deliveryType,
          discountCodeId: discountInfo.appliedCode?.id || null,
          pointsToUse: loyaltyPointsUsed,
        };
      }

      // Submit order via cart checkout
      const order = await checkoutCart(checkoutData);

      // Clear cart after successful order
      await clearAllItems();

      // Get order ID
      const orderId = order._id || order.id;

      // Redirect based on payment method
      if (paymentMethod === 'cod' || paymentMethod === 'cashondelivery') {
        try {
          await payByCash(orderId);
        } catch (err) {
          console.error('payByCash error:', err);
          toast.warning('Order placed but payment status not recorded. Please check your order.');
        }

        toast.success('Order placed successfully!', {
          description: `Order #${orderId}`,
        });
        navigate(`/orders/${orderId}`, {
          state: { orderSuccess: true },
        });
      } else {
        navigate(`/payment/${orderId}`);
      }
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

  const handlePointsApplied = (points) => {
    setLoyaltyPointsUsed(points);
  };

  return {
    cartItems,
    paymentMethod,
    deliveryType,
    deliveryTypes,
    subtotal,
    shipping: shippingFee,
    shippingFees: shippingData.fees,
    shippingWeather: shippingData.weather,
    discount: discountInfo.discountAmount || 0,
    loyaltyPointsDiscount: loyaltyPointsUsed,
    total,
    loading: loading || shippingLoading,
    shippingLoading,
    error,
    submitting,
    handlePaymentMethodChange,
    handleDeliveryTypeChange,
    handleSubmitOrder,
    handleDiscountApplied,
    handlePointsApplied,
  };
};
