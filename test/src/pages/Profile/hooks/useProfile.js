import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Mock user data
const MOCK_USER = {
  _id: 'user123',
  fullName: 'John Doe',
  username: 'johndoe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  avatar: 'https://via.placeholder.com/120/3b82f6/ffffff?text=JD',
  role: 'customer',
  isVerified: true,
  socialProvider: null,
  socialId: null,
  loyaltyPoints: 250,
  defaultAddressId: null,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date(),
};

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

      // TODO: Replace with actual API call
      // const response = await fetch('/api/users/profile');
      // const data = await response.json();

      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(MOCK_USER);
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

      // TODO: Replace with actual API call
      // const response = await fetch('/api/users/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates),
      // });
      // const data = await response.json();

      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update local state
      setUser(prev => ({ ...prev, ...updates, updatedAt: new Date() }));
      
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

      // TODO: Replace with actual API call
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const response = await fetch('/api/users/avatar', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();

      // Mock: Create object URL for preview
      const avatarUrl = URL.createObjectURL(file);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setUser(prev => ({ ...prev, avatar: avatarUrl, updatedAt: new Date() }));
      
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

      // TODO: Replace with actual API call
      // When implemented, these parameters will be used:
      const passwordData = { currentPassword, newPassword };
      
      // Mock delay and validation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Password change requested:', passwordData);

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
