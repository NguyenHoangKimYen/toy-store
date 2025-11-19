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
      
      const data = await addressesService.getAddressesByUserId(userId);
      const addressesArray = Array.isArray(data) ? data : (data.data || []);
      
      setAddresses(addressesArray);
      
      // Find default address
      const defaultAddr = addressesArray.find(addr => addr.isDefault);
      setDefaultAddress(defaultAddr || null);
      
    } catch (err) {
      setError(err.message || 'Failed to load addresses');
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
      const newAddress = await addressesService.createAddress({
        ...addressData,
        userId,
      });
      await fetchAddresses(); // Refresh list
      toast.success('Address added successfully');
      return newAddress;
    } catch (error) {
      console.error('Error creating address:', error);
      toast.error(error.message || 'Failed to add address');
      throw error;
    }
  };

  // Update an existing address
  const updateAddress = async (addressId, addressData) => {
    try {
      const updatedAddress = await addressesService.updateAddress(addressId, addressData);
      await fetchAddresses(); // Refresh list
      toast.success('Address updated successfully');
      return updatedAddress;
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error(error.message || 'Failed to update address');
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
      console.error('Error deleting address:', error);
      toast.error(error.message || 'Failed to delete address');
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
      console.error('Error setting default address:', error);
      toast.error(error.message || 'Failed to set default address');
      throw error;
    }
  };

  // Get address suggestions (for autocomplete)
  const getAddressSuggestions = async (text) => {
    try {
      const suggestions = await addressesService.getAddressSuggestions(text);
      return Array.isArray(suggestions) ? suggestions : (suggestions.data || []);
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
