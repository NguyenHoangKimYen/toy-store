import { useState, useCallback } from 'react';
import {
  validateDiscountCode as validateCodeService,
  getDiscountCodes,
  getDiscountCode,
  useDiscountCode as applyDiscountCode,
  calculateDiscount,
  isValidCodeFormat,
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

    // Check format first
    if (!isValidCodeFormat(codeToValidate)) {
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
      const newAmount = calculateDiscount(appliedCode.value, orderTotal);
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

    try {
      await applyDiscountCode(appliedCode._id);
      return true;
    } catch (err) {
      console.error('Failed to mark discount code as used:', err);
      return false;
    }
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

      const result = await getDiscountCodes(availableOnly);
      setCodes(result.discountCodes || []);
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

      const result = await getDiscountCode(codeString);
      setCodeDetails(result.discountCode || null);
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
