import { useState, useEffect } from 'react';
import { getOrderById } from '@/services/orders.service';

/**
 * Hook to fetch detailed order information
 * Uses the backend endpoint GET /orders/:id
 * Returns order with items, history, shipping, payment details
 */
export const useOrderDetail = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await getOrderById(orderId);
        
        if (response.success) {
          setOrder(response.data);
        } else {
          setError(response.message || 'Failed to load order details');
        }
      } catch (err) {
        console.error('Error fetching order detail:', err);
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  return { order, loading, error };
};
