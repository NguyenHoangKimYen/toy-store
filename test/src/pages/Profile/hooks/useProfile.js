import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as usersService from '@/services/users.service';
import { useAuth } from '@/hooks/useAuth';

export const useProfile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Auth user from context:', authUser);

      if (!authUser) {
        throw new Error('No user session found');
      }

      // Get user ID from auth context - check multiple possible field names
      const currentUserId = authUser?.id || authUser?._id || authUser?.userId;
      
      console.log('Extracted user ID:', currentUserId);
      
      if (!currentUserId) {
        console.error('Auth user object:', authUser);
        throw new Error('No user ID found in session');
      }

      const userData = await usersService.getUserById(currentUserId);
      setUser(userData);
    } catch (err) {
      // Don't log/show error if user is simply not logged in
      if (err.message !== 'No user session found') {
        console.error('Error loading profile:', err);
        toast.error('Failed to load profile');
      }
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [authUser, loadProfile]);

  const updateProfile = async (updates) => {
    try {
      setError(null);

      if (!user?._id) {
        throw new Error('No user ID found');
      }

      // Use PUT for full update
      const updatedUser = await usersService.updateUser(user._id, {
        ...user,
        ...updates,
      });

      setUser(updatedUser);
      toast.success('Profile updated successfully');
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

      // Check if user has existing avatar
      const result = user.avatar 
        ? await usersService.updateAvatar(user._id, file)
        : await usersService.uploadAvatar(user._id, file);

      setUser(prev => ({ ...prev, avatar: result.avatar || result.data?.avatar }));
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
    error,
    updateProfile,
    updateAvatar,
    changePassword,
    refetch: loadProfile,
  };
};
