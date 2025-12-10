import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as usersService from '@/services/users.service';

/**
 * Universal Users Hook - Use this everywhere for user data
 * @param {Object} options - Configuration options
 * @param {string} options.userId - Fetch single user by ID
 * @param {Object} options.params - Query parameters for filtering (role, isVerified, socialProvider, search)
 * @param {string} options.searchQuery - Deprecated: use params.search instead
 * @param {boolean} options.autoFetch - Auto-fetch on mount (default: true)
 * @param {Array} options.dependencies - Additional dependencies for refetch
 * @returns {Object} User data and CRUD operations
 * 
 * Supported params:
 * - role: 'customer' or 'admin'
 * - isVerified: 'true' or 'false'
 * - socialProvider: 'local', 'google', 'facebook'
 * - search: Search keyword
 * - page, limit: Pagination
 */
export const useUsers = (options = {}) => {
  const {
    userId = null,
    params = {},
    searchQuery = '', // Deprecated, use params.search
    autoFetch = true,
    dependencies = []
  } = options;

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalLoyaltyPoints: 0,
    adminUsers: 0
  });
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  // Stringify params and dependencies for stable comparison
  const paramsKey = JSON.stringify(params);
  const depsKey = JSON.stringify(dependencies);

  // Fetch single user
  const fetchUser = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await usersService.getUserById(id);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch multiple users (list)
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      /**
       * PAGINATION CONFIGURATION:
       * - Users per page: 50 (consistent with admin products)
       * - Efficient for admin management without overwhelming UI
       */
      const ADMIN_USERS_PER_PAGE = 50;
      
      // Merge params with search query (for backwards compatibility)
      const queryParams = {
        ...params,
        keyword: params.keyword || params.search || searchQuery || undefined,
        limit: params.limit || ADMIN_USERS_PER_PAGE,
      }
      
      // Remove search param since backend uses keyword
      delete queryParams.search;
      
      // Remove undefined/empty values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key]
        }
      })
      
      const data = await usersService.getUsers(queryParams);
      
      // Handle different response formats
      const usersArray = Array.isArray(data) ? data : (data.users || data.data || []);
      
      // Extract pagination info from response
      const paginationInfo = data.total ? {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages
      } : null;
      
      // Use aggregated stats from backend if available, otherwise calculate from current page
      const backendStats = data.stats;
      const calculatedStats = backendStats || {
        totalUsers: paginationInfo?.total || usersArray.length,
        verifiedUsers: usersArray.filter(u => u.isVerified).length,
        totalLoyaltyPoints: usersArray.reduce((sum, u) => sum + (u.loyaltyPoints || 0), 0),
        adminUsers: usersArray.filter(u => u.role === 'admin').length,
      };
      
      setUsers(usersArray);
      setPagination(paginationInfo);
      setStats(calculatedStats);
      return usersArray;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
      setUsers([]);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, searchQuery]);

  // Auto-fetch on mount
  useEffect(() => {
    if (!autoFetch) return;

    if (userId) {
      // Fetch single user
      fetchUser(userId);
    } else {
      // Fetch users list with debounce
      const delayTimer = setTimeout(() => {
        fetchUsers();
      }, 500);
      return () => clearTimeout(delayTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, paramsKey, searchQuery, autoFetch, depsKey]);

  // Create user
  const createUser = async (userData) => {
    try {
      const newUser = await usersService.createUser(userData);
      await fetchUsers(); // Refresh list
      toast.success('User created successfully');
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
      throw error;
    }
  };

  // Update user
  const updateUser = async (id, userData) => {
    try {
      const updatedUser = await usersService.updateUser(id, userData);
      if (userId) {
        setUser(updatedUser);
      } else {
        await fetchUsers(); // Refresh list
      }
      toast.success('User updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      throw error;
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    try {
      await usersService.deleteUser(id);
      await fetchUsers(); // Refresh list
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      throw error;
    }
  };

  // Bulk delete users
  const bulkDeleteUsers = async (userIds) => {
    try {
      await Promise.all(userIds.map(id => usersService.deleteUser(id)));
      await fetchUsers(); // Refresh list
      toast.success(`${userIds.length} user(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting users:', error);
      toast.error('Failed to delete users');
      throw error;
    }
  };

  return {
    // Single user mode
    user,
    
    // Multiple users mode
    users,
    stats,
    
    // Server-side pagination info
    pagination,
    total: pagination?.total || users.length,
    totalPages: pagination?.totalPages || 1,
    currentPage: pagination?.page || 1,
    
    // Common
    loading,
    error,
    
    // Operations
    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    
    // Refresh functions
    refreshUser: () => userId ? fetchUser(userId) : null,
    refreshUsers: fetchUsers,
    fetchUser,
    fetchUsers,
  };
};

/**
 * Hook for single user detail
 * @param {string} userId - User ID to fetch
 */
export const useUser = (userId) => {
  return useUsers({ userId, autoFetch: !!userId });
};

/**
 * Hook for users list with search
 * @param {string} searchQuery - Search query
 */
export const useUsersList = (searchQuery = '') => {
  return useUsers({ searchQuery, autoFetch: true });
};
