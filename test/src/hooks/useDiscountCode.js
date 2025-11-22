import { useState, useCallback } from 'react';
import {
  validateDiscountCode as validateCodeService,
} from '../services/discountCodes.service';

/**
 * Custom hook for managing discount code validation and application
 * @param {number} orderTotal - Current order total
 * @returns {Object} - Discount code state and actions
 */
export const useDiscountCode = (orderTotal = 0) => {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [appliedCode, setAppliedCode] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  /**
   * Validate the discount code
   */
  const validate = useCallback(async (codeToValidate = code) => {
    if (!codeToValidate || !codeToValidate.trim()) {
      setError('Please enter a discount code');
      return false;
    }

    // Check format first (5 alphanumeric characters)
    const isValid = /^[A-Z0-9]{5}$/i.test(codeToValidate.trim());
    if (!isValid) {
      setError('Invalid code format. Code must be 5 alphanumeric characters.');
      return false;
    }

    try {
      setValidating(true);
      setError(null);

      const result = await validateCodeService(codeToValidate, orderTotal);

      if (result.valid) {
        setValidationResult(result);
        setDiscountAmount(result.discountAmount || 0);
        return true;
      } else {
        setError(result.message || 'Invalid discount code');
        setValidationResult(null);
        setDiscountAmount(0);
        return false;
      }
    } catch (err) {
      setError(err.message || 'Failed to validate discount code');
      setValidationResult(null);
      setDiscountAmount(0);
      return false;
    } finally {
      setValidating(false);
    }
  }, [code, orderTotal]);

  /**
   * Apply the discount code
   */
  const apply = useCallback(async () => {
    const isValid = await validate();

    if (isValid && validationResult) {
      setAppliedCode({
        ...validationResult.discountCode,
        appliedAt: new Date().toISOString(),
      });
      return true;
    }

    return false;
  }, [validate, validationResult]);

  /**
   * Remove/clear the applied discount code
   */
  const remove = useCallback(() => {
    setAppliedCode(null);
    setDiscountAmount(0);
    setValidationResult(null);
    setCode('');
    setError(null);
  }, []);

  /**
   * Update code input value
   */
  const updateCode = useCallback((newCode) => {
    setCode(newCode.toUpperCase());
    setError(null);
    setValidationResult(null);
  }, []);

  /**
   * Recalculate discount when order total changes
   */
  const recalculate = useCallback(() => {
    if (appliedCode && appliedCode.value) {
      const discount = parseFloat(appliedCode.value);
      const newAmount = Math.min(discount, orderTotal);
      setDiscountAmount(newAmount);
    }
  }, [appliedCode, orderTotal]);

  /**
   * Mark discount code as used (for order completion)
   */
  const markAsUsed = useCallback(async () => {
    if (!appliedCode || !appliedCode._id) {
      return false;
    }

    // This would be implemented when backend supports it
    return true;
  }, [appliedCode]);

  return {
    code,
    updateCode,
    validate,
    apply,
    remove,
    recalculate,
    markAsUsed,
    validating,
    error,
    validationResult,
    appliedCode,
    discountAmount,
    isApplied: !!appliedCode,
  };
};

/**
 * Custom hook for fetching discount codes list
 * @param {boolean} availableOnly - Only fetch available codes
 * @returns {Object} - Discount codes state
 */
export const useDiscountCodes = (availableOnly = true) => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Import dynamically to avoid circular dependencies
      const { getAllDiscountCodes } = await import('../services/discountCodes.service');
      const result = await getAllDiscountCodes({ available: availableOnly });
      setCodes(result.discountCodes || result.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load discount codes');
      console.error('Error loading discount codes:', err);
    } finally {
      setLoading(false);
    }
  }, [availableOnly]);

  const refresh = useCallback(() => {
    loadCodes();
  }, [loadCodes]);

  return {
    codes,
    loading,
    error,
    loadCodes,
    refresh,
  };
};

/**
 * Custom hook for fetching a single discount code
 * @param {string} codeString - Discount code string
 * @returns {Object} - Discount code state
 */
export const useDiscountCodeDetails = (codeString) => {
  const [codeDetails, setCodeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCode = useCallback(async () => {
    if (!codeString) return;

    try {
      setLoading(true);
      setError(null);

      // Import dynamically to avoid circular dependencies
      const { getDiscountCodeById } = await import('../services/discountCodes.service');
      const result = await getDiscountCodeById(codeString);
      setCodeDetails(result.discountCode || result.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load discount code');
      console.error('Error loading discount code:', err);
    } finally {
      setLoading(false);
    }
  }, [codeString]);

  return {
    codeDetails,
    loading,
    error,
    loadCode,
  };
};

export default useDiscountCode;
