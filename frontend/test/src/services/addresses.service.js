import apiClient from './config';

/**
 * Address Service
 * Handles all address-related API calls
 */

// Get all addresses (admin only, with optional filters)
export const getAllAddresses = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `/addresses?${queryParams}` : '/addresses';
  const response = await apiClient.get(url);
  return response.data;
};

// Get all addresses for a specific user
export const getAddressesByUserId = async (userId) => {
  const response = await apiClient.get(`/addresses/user/${userId}`);
  return response.data;
};

// Get a single address by ID
export const getAddressById = async (addressId) => {
  const response = await apiClient.get(`/addresses/${addressId}`);
  return response.data;
};

// Get default address for a user
export const getDefaultAddress = async (userId) => {
  const response = await apiClient.get(`/addresses/default/${userId}`);
  return response.data;
};

// Create a new address
export const createAddress = async (addressData) => {
  const response = await apiClient.post('/addresses', addressData);
  return response.data;
};

// Update an existing address
export const updateAddress = async (addressId, addressData) => {
  const response = await apiClient.put(`/addresses/${addressId}`, addressData);
  return response.data;
};

// Set an address as default for a user
export const setDefaultAddress = async (userId, addressId) => {
  const response = await apiClient.patch(`/addresses/${userId}/default/${addressId}`);
  return response.data;
};

// Delete an address
export const deleteAddress = async (addressId) => {
  const response = await apiClient.delete(`/addresses/${addressId}`);
  return response.data;
};

// Get address suggestions from VietMap API (autocomplete)
export const getAddressSuggestions = async (text) => {
  if (!text || text.length < 2) {
    return [];
  }
  
  const response = await apiClient.get(`/addresses/suggest?text=${encodeURIComponent(text)}`);
  return response.data || [];
};

export default {
  getAllAddresses,
  getAddressesByUserId,
  getAddressById,
  getDefaultAddress,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  getAddressSuggestions,
};
