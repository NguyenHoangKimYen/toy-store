import { useState, useEffect, useCallback, useRef } from 'react';
import { useOrders } from '@/hooks';
import { useAuth } from '@/hooks';
import { toast } from 'sonner';

export const useOrderHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading, error, pagination, fetchMyOrders } = useOrders();
  const hasFetchedRef = useRef(false);
  const lastUserIdRef = useRef(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'date-desc'
  });

  // Fetch with current filters and pagination
  const fetchOrders = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      sortBy: filters.sortBy
    };
    
    // Only add status filter if not 'all'
    if (filters.status !== 'all') {
      params.status = filters.status;
    }
    
    // Add search if provided
    if (filters.search) {
      params.search = filters.search;
    }
    
    fetchMyOrders(params);
  }, [currentPage, pageSize, filters, fetchMyOrders]);

  // Auto-fetch orders when user is logged in or filters change
  useEffect(() => {
    // Don't fetch while auth is loading
    if (authLoading) return;
    
    // Don't fetch for guests
    const userId = user?._id || user?.id;
    if (!userId) {
      hasFetchedRef.current = false;
      return;
    }
    
    // Detect user change (login/logout)
    if (lastUserIdRef.current !== userId) {
      lastUserIdRef.current = userId;
      hasFetchedRef.current = false;
      setCurrentPage(1); // Reset to first page on user change
    }
    
    // Fetch orders
    fetchOrders();
    hasFetchedRef.current = true;
  }, [authLoading, user, fetchOrders]);

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
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const refetch = () => {
    fetchOrders();
  };

  return {
    orders,
    loading,
    error,
    filters,
    pagination: {
      ...pagination,
      currentPage,
      pageSize
    },
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    refetch
  };
};
