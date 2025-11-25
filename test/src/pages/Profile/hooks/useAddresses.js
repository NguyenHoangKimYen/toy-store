import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as addressesService from '@/services/addresses.service';

export const useAddresses = (userId) => {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAddresses = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await addressesService.getAddressesByUserId(userId);
      // Backend returns { success: true, data: [...] }
      const addressesArray = response?.data || [];
      
      setAddresses(addressesArray);
      
      // Find default address
      const defaultAddr = addressesArray.find(addr => addr.isDefault);
      setDefaultAddress(defaultAddr || null);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load addresses';
      setError(errorMsg);
      console.error('Error fetching addresses:', err);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Create a new address
  const createAddress = async (addressData) => {
    try {
      // If no userId (guest user), return address data without saving to backend
      if (!userId) {
        // For guest users, just return the address data with a temporary ID
        const guestAddress = {
          ...addressData,
          _id: `guest_${Date.now()}`,
          isGuest: true,
        };
        toast.success('Address added');
        return guestAddress;
      }
      
      const response = await addressesService.createAddress({
        ...addressData,
        userId,
      });
      // Backend returns { success: true, data: {...} }
      await fetchAddresses(); // Refresh list
      toast.success('Address added successfully');
      return response?.data || response;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add address';
      console.error('Error creating address:', errorMsg);
      toast.error(errorMsg);
      throw error;
    }
  };

  // Update an existing address
  const updateAddress = async (addressId, addressData) => {
    try {
      const response = await addressesService.updateAddress(addressId, addressData);
      // Backend returns { success: true, data: {...} }
      await fetchAddresses(); // Refresh list
      toast.success('Address updated successfully');
      return response?.data || response;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update address';
      console.error('Error updating address:', errorMsg);
      toast.error(errorMsg);
      throw error;
    }
  };

  // Delete an address
  const deleteAddress = async (addressId) => {
    try {
      await addressesService.deleteAddress(addressId);
      await fetchAddresses(); // Refresh list
      toast.success('Address deleted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete address';
      console.error('Error deleting address:', errorMsg);
      toast.error(errorMsg);
      throw error;
    }
  };

  // Set an address as default
  const setAsDefault = async (addressId) => {
    try {
      await addressesService.setDefaultAddress(userId, addressId);
      await fetchAddresses(); // Refresh list
      toast.success('Default address updated');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to set default address';
      console.error('Error setting default address:', errorMsg);
      toast.error(errorMsg);
      throw error;
    }
  };

  // Get address suggestions (for autocomplete)
  const getAddressSuggestions = async (text) => {
    try {
      const response = await addressesService.getAddressSuggestions(text);
      // Backend returns { success: true, data: [...] }
      return response?.data || [];
    } catch (error) {
      console.error('Error getting address suggestions:', error);
      return [];
    }
  };

  return {
    addresses,
    defaultAddress,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
    refreshAddresses: fetchAddresses,
    getAddressSuggestions,
  };
};
