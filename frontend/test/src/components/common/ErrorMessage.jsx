import React from 'react'

const ErrorMessage = ({ 
  title = 'Error Loading Data', 
  message, 
  onRetry 
}) => {
  return (
    <div className='text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg'>
      <div className='text-red-500 text-5xl mb-4'>⚠️</div>
      <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
        {title}
      </h3>
      <p className='text-gray-600 dark:text-gray-400 mb-4'>{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          Retry
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
