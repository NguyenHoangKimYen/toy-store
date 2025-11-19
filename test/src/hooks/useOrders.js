import { useState, useEffect, useCallback } from 'react';
import {
  getMyOrders,
  getAllOrders,
  getOrderById,
  createOrder,
  createGuestOrder,
  checkoutFromCart,
  guestCheckoutFromCart,
  updateOrderStatus,
  cancelOrder,
} from '../services';
import { useAuth } from './useAuth';

/**
 * Custom hook for order management
 * Handles order creation, fetching, and status updates
 */
export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's orders
  const fetchMyOrders = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch all orders (admin only)
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch all orders');
      console.error('Error fetching all orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single order by ID
  const fetchOrderById = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getOrderById(orderId);
      setCurrentOrder(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
      console.error('Error fetching order details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize orders on mount
  useEffect(() => {
    if (user?.id) {
      fetchMyOrders();
    }
  }, [user, fetchMyOrders]);

  // Create order directly
  const placeOrder = useCallback(
    async (orderData) => {
      try {
        setLoading(true);
        setError(null);

        const newOrder = user?.id ? await createOrder(orderData) : await createGuestOrder(orderData);

        setCurrentOrder(newOrder);
        return newOrder;
      } catch (err) {
        setError(err.message || 'Failed to create order');
        console.error('Error creating order:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Checkout from cart
  const checkoutCart = useCallback(
    async (checkoutData) => {
      try {
        setLoading(true);
        setError(null);

        const newOrder = user?.id ? await checkoutFromCart(checkoutData) : await guestCheckoutFromCart(checkoutData);

        setCurrentOrder(newOrder);

        // Refresh orders list
        if (user?.id) {
          await fetchMyOrders();
        }

        return newOrder;
      } catch (err) {
        setError(err.message || 'Failed to checkout from cart');
        console.error('Error checking out from cart:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchMyOrders]
  );

  // Update order status (admin only)
  const updateStatus = useCallback(
    async (orderId, status) => {
      try {
        setLoading(true);
        setError(null);

        const updatedOrder = await updateOrderStatus(orderId, status);

        // Update orders list
        setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));

        // Update current order if it's the one being updated
        if (currentOrder?.id === orderId) {
          setCurrentOrder(updatedOrder);
        }

        return updatedOrder;
      } catch (err) {
        setError(err.message || 'Failed to update order status');
        console.error('Error updating order status:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrder]
  );

  // Cancel order
  const cancelCurrentOrder = useCallback(
    async (orderId) => {
      try {
        setLoading(true);
        setError(null);

        const cancelledOrder = await cancelOrder(orderId);

        // Update orders list
        setOrders((prev) => prev.map((order) => (order.id === orderId ? cancelledOrder : order)));

        // Update current order if it's the one being cancelled
        if (currentOrder?.id === orderId) {
          setCurrentOrder(cancelledOrder);
        }

        // Refresh orders list
        if (user?.id) {
          await fetchMyOrders();
        }

        return cancelledOrder;
      } catch (err) {
        setError(err.message || 'Failed to cancel order');
        console.error('Error cancelling order:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrder, user, fetchMyOrders]
  );

  // Filter orders by status
  const getOrdersByStatus = useCallback(
    (status) => {
      return orders.filter((order) => order.status === status);
    },
    [orders]
  );

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipping: orders.filter((o) => o.status === 'shipping').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    returned: orders.filter((o) => o.status === 'returned').length,
    totalSpent: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
  };

  return {
    orders,
    currentOrder,
    loading,
    error,
    orderStats,
    fetchMyOrders,
    fetchAllOrders,
    fetchOrderById,
    placeOrder,
    checkoutCart,
    updateStatus,
    cancelCurrentOrder,
    getOrdersByStatus,
  };
};
