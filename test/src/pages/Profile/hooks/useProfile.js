import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as usersService from '@/services/users.service';

export const useProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user ID from auth context/localStorage
      const currentUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
      
      if (!currentUserId) {
        throw new Error('No user session found');
      }

      const userData = await usersService.getUserById(currentUserId);
      setUser(userData);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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
