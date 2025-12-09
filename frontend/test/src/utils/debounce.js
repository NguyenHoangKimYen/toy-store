/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} The debounced function with a cancel method
 */
export function debounce(func, wait) {
  let timeoutId = null;

  const debounced = function (...args) {
    const context = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      func.apply(context, args);
    }, wait);
  };

  debounced.cancel = function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Creates a debounced function that groups calls by a key.
 * Each key has its own independent debounce timer.
 *
 * @param {Function} func - The function to debounce, receives (key, ...args)
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Object} Object with call(key, ...args), cancel(key), and cancelAll() methods
 */
export function debouncedByKey(func, wait) {
  const timeouts = new Map();

  return {
    call(key, ...args) {
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key));
      }

      const timeoutId = setTimeout(() => {
        timeouts.delete(key);
        func(key, ...args);
      }, wait);

      timeouts.set(key, timeoutId);
    },

    cancel(key) {
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key));
        timeouts.delete(key);
      }
    },

    cancelAll() {
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      timeouts.clear();
    },
  };
}
