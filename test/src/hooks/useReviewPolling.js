import { useEffect, useRef } from 'react';

/**
 * Hook for polling reviews at regular intervals to simulate real-time updates
 * @param {Function} fetchFunction - Function to fetch reviews
 * @param {number} interval - Polling interval in milliseconds (default: 30000ms = 30s)
 * @param {boolean} enabled - Whether polling is enabled
 */
export const useReviewPolling = (fetchFunction, interval = 30000, enabled = true) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled || !fetchFunction) {
      return;
    }

    // Start polling
    intervalRef.current = setInterval(() => {
      fetchFunction();
    }, interval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchFunction, interval, enabled]);

  // Return stop function for manual control
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return { stopPolling };
};
