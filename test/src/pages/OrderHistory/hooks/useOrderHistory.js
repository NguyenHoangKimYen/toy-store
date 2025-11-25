import { useState, useEffect, useMemo } from 'react';
import { useOrders } from '@/hooks';
import { toast } from 'sonner';

// Helper to parse MongoDB Decimal128
const parseDecimal = (value) => {
  if (!value) return 0;
  if (typeof value === 'object' && value.$numberDecimal) {
    return parseFloat(value.$numberDecimal);
  }
  return parseFloat(value) || 0;
};

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
        // Search in order _id
        const orderId = order._id?.toString().toLowerCase() || '';
        
        // Search in product names
        const hasMatchingProduct = order.items?.some(item => 
          item.productId?.name?.toLowerCase().includes(searchLower)
        );
        
        return orderId.includes(searchLower) || hasMatchingProduct;
      });
    }

    // Sort orders
    const [field, order] = filters.sortBy.split('-');
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (field === 'date') {
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
      } else if (field === 'total') {
        const aTotal = parseDecimal(a.totalAmount);
        const bTotal = parseDecimal(b.totalAmount);
        comparison = bTotal - aTotal;
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
