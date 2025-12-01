import apiClient from './config';

export const getLoyaltyConfig = async () => {
  return apiClient.get('/loyalty/config');
};

export const getMyLoyaltyInfo = async () => {
  return apiClient.get('/loyalty/me');
};

export const getMyCoinTransactions = async (limit = 50) => {
  return apiClient.get('/loyalty/points', { params: { limit } });
};
