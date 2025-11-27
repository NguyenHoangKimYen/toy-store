import { apiRequest } from './config';

export const getLoyaltyConfig = async () => {
  return apiRequest('/loyalty/config', {
    method: 'GET',
  });
};

export const getMyLoyaltyInfo = async () => {
  return apiRequest('/loyalty/me', {
    method: 'GET',
  });
};

export const getMyCoinTransactions = async (limit = 50) => {
  return apiRequest(`/loyalty/points?limit=${limit}`, {
    method: 'GET',
  });
};
