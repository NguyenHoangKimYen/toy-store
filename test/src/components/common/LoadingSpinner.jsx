import React from 'react'

/**
 * Unified Loading Spinner Component
 * Single reusable loader for the entire application
 * 
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @param {string} variant - 'page' | 'inline' | 'button' (default: 'page')
 * @param {string} message - Loading message text
 * @param {string} color - Tailwind color class (default: 'violet-600')
 */
const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'page',
  message = 'Loading...',
  color = 'violet-600'
}) => {
  // Size configurations
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const spinnerSize = sizes[size] || sizes.md;

  // Variant layouts
  if (variant === 'button') {
    // Inline spinner for buttons
    return (
      <div className={`${spinnerSize} animate-spin rounded-full border-2 border-solid border-current border-r-transparent`} />
    );
  }

  if (variant === 'inline') {
    // Inline spinner with optional message
    return (
      <div className="flex items-center justify-center gap-3">
        <div className={`${spinnerSize} animate-spin rounded-full border-2 border-solid border-${color} border-r-transparent`} />
        {message && <span className="text-gray-600 dark:text-gray-400">{message}</span>}
      </div>
    );
  }

  // Default: Full page/section loader
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className={`${spinnerSize} animate-spin rounded-full border-4 border-solid border-${color} border-r-transparent mx-auto mb-4`} />
        {message && <p className="text-gray-600 dark:text-gray-400">{message}</p>}
      </div>
    </div>
  );
}

export default LoadingSpinner
