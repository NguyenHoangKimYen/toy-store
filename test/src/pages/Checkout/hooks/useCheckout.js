import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart, useOrders } from '@/hooks';
import { ROUTES } from '@/config/routes';
import { payByCash } from '@/services';

export const useCheckout = () => {
  const navigate = useNavigate();
  const { cart, cartItems, cartSummary, loading: cartLoading, clearAllItems } = useCart();
  const { checkoutCart, loading: orderLoading } = useOrders();
  
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cashondelivery');
  const [discountInfo, setDiscountInfo] = useState({
    appliedCode: null,
    discountAmount: 0,
    isApplied: false,
  });
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);

  // Calculate totals
  const subtotal = cartSummary.subtotal;
  const shipping = subtotal > 1000000 ? 0 : 50000; // Free shipping over 1,000,000 VND
  const tax = subtotal * 0.1; // 10% tax
  const discount = discountInfo.discountAmount || 0;
  const total = Math.max(0, subtotal + shipping + tax - discount - loyaltyPointsUsed);

  const loading = cartLoading || orderLoading;

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
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
      
      // For guest checkout, send sessionId and guestInfo
      // For logged-in users, send addressId
      if (isGuestAddress) {
        // Get sessionId from localStorage for guest
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
          deliveryType: 'standard',
          discountCodeId: discountInfo.appliedCode?.id || null,
          pointsToUse: loyaltyPointsUsed,
        };
      } else {
        checkoutData = {
          addressId,
          paymentMethod,
          deliveryType: 'standard',
          discountCodeId: discountInfo.appliedCode?.id || null,
          pointsToUse: loyaltyPointsUsed,
        };
      }

      // Submit order via cart checkout
      const order = await checkoutCart(checkoutData);

      // Clear cart after successful order
      await clearAllItems();

      // Get order ID - handle both _id and id formats
      const orderId = order._id || order.id;

      // Redirect based on payment method
      if (paymentMethod === 'cod') {
        try {
          await payByCash(orderId);
        } catch (err) {
          console.error('payByCash error:', err);
          // vẫn tiếp tục, chỉ cảnh báo
          toast.warning('Đặt COD nhưng chưa ghi nhận trạng thái thanh toán. Vui lòng kiểm tra đơn.');
        }

        // COD - show success and go to order detail
        toast.success('Order placed successfully!', {
          description: `Order #${orderId}`,
        });
        navigate(`/orders/${orderId}`, {
          state: { orderSuccess: true },
        });
      } else {
        // Online payment - redirect to payment page without showing success toast yet
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
    subtotal,
    shipping,
    tax,
    discount: discountInfo.discountAmount || 0,
    loyaltyPointsDiscount: loyaltyPointsUsed,
    total,
    loading,
    error,
    submitting,
    handlePaymentMethodChange,
    handleSubmitOrder,
    handleDiscountApplied,
    handlePointsApplied,
  };
};
