import React from 'react'
import { LoadingSpinner, ErrorMessage } from './index'

/**
 * Reusable scrollable content area with loading and error states
 */
const ScrollableContent = ({ 
  loading, 
  error, 
  onRetry,
  loadingMessage = 'Loading...',
  errorTitle = 'Error Loading Data',
  children 
}) => {
  return (
    <div className='flex-1 overflow-y-auto'>
      {error ? (
        <ErrorMessage 
          title={errorTitle}
          message={error}
          onRetry={onRetry}
        />
      ) : loading ? (
        <LoadingSpinner message={loadingMessage} />
      ) : (
        children
      )}
    </div>
  )
}

export default ScrollableContent
