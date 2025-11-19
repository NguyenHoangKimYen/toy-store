import { useState, useEffect, useMemo } from 'react';
import { useOrders } from '@/hooks';
import { toast } from 'sonner';

export const useOrderHistory = () => {
  const { orders: allOrders, loading, error, fetchMyOrders } = useOrders();
  
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'date-desc'
  });

  // Apply filters and sorting to orders
  const orders = useMemo(() => {
    let filtered = [...allOrders];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Filter by search term (search in order ID or items)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(order => {
        const orderId = order.id?.toString().toLowerCase() || '';
        const orderNumber = order.orderNumber?.toLowerCase() || '';
        return orderId.includes(searchLower) || orderNumber.includes(searchLower);
      });
    }

    // Sort orders
    const [field, order] = filters.sortBy.split('-');
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (field === 'date') {
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
      } else if (field === 'total') {
        comparison = (b.totalAmount || 0) - (a.totalAmount || 0);
      }
      
      return order === 'desc' ? comparison : -comparison;
    });

    return filtered;
  }, [allOrders, filters]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load orders');
    }
  }, [error]);

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
    fetchMyOrders();
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
