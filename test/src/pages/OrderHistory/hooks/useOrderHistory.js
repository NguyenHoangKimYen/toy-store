import { useState, useEffect } from 'react';
import { getOrders } from '@/services/orders.service';
import { toast } from 'sonner';

export const useOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'date-desc'
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      if (filters.search) {
        params.search = filters.search;
      }

      // Parse sortBy
      const [field, order] = filters.sortBy.split('-');
      params.sort = `${field}:${order}`;

      const data = await getOrders(params);
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  const refetch = () => {
    loadOrders();
  };

  return {
    orders,
    loading,
    error,
    filters,
    handleFilterChange,
    handleSearch,
    refetch
  };
};
