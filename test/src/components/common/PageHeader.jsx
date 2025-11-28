import React from 'react'

/**
 * Reusable page header component for admin pages
 */
const PageHeader = ({ 
  title, 
  description, 
  actionButton 
}) => {
  return (
    <div className='mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 flex-shrink-0'>
      <div className='flex-1 min-w-0'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2'>
          {title}
        </h1>
        {description && (
          <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
            {description}
          </p>
        )}
      </div>
      {actionButton && (
        <div className='flex-shrink-0 w-full sm:w-auto'>
          {actionButton}
        </div>
      )}
    </div>
  )
}

export default PageHeader
