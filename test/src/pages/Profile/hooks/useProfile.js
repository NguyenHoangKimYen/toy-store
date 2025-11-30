import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import * as usersService from '@/services/users.service';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks'; // Using global user hook

export const useProfile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [error, setError] = useState(null);

  // Get user ID from auth context
  const currentUserId = authUser?.id || authUser?._id || authUser?.userId;
  
  // Use global user hook for fetching
  const { 
    user, 
    loading, 
    error: fetchError,
    updateProfile: updateProfileFromHook,
    refreshUser 
  } = useUser(currentUserId);

  // Handle 404 errors (user not found in database)
  useEffect(() => {
    if (fetchError && (fetchError.includes('404') || fetchError.includes('not found'))) {
      // User ID in localStorage is invalid - clear auth and redirect
      toast.error('Your session is invalid. Please login again.', {
        duration: 5000,
      });
      
      // Clear all auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('guestSessionId');
      
      // Logout and redirect to login
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    }
  }, [fetchError, logout, navigate]);

  const updateProfile = async (updates) => {
    try {
      setError(null);

      if (!user?._id) {
        throw new Error('No user ID found');
      }
      if (typeof updateProfileFromHook !== 'function') {
        throw new Error('Profile update is not available (not logged in)');
      }

      await updateProfileFromHook(updates);

      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      toast.error('Failed to update profile');
      return false;
    }
  };

  const updateAvatar = async (file) => {
    try {
      setError(null);

      if (!user?._id) {
        throw new Error('No user ID found');
      }

      // Avatar upload still uses service directly (not part of standard CRUD)
      if (user.avatar) {
        await usersService.updateAvatar(user._id, file);
      } else {
        await usersService.uploadAvatar(user._id, file);
      }

      // Refresh user data after avatar update
      await refreshUser();
      toast.success('Avatar updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(err.message || 'Failed to update avatar');
      toast.error('Failed to update avatar');
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);

      if (!user?._id) {
        throw new Error('No user ID found');
      }

      // Password change uses service directly (special operation)
      await usersService.setUserPassword(user._id, newPassword, newPassword);
      toast.success('Password changed successfully');
      return true;
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
      toast.error('Failed to change password');
      return false;
    }
  };

  return {
    user,
    loading,
    error: error || fetchError,
    updateProfile,
    updateAvatar,
    changePassword,
    refetch: refreshUser,
  };
};
