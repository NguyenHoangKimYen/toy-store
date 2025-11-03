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
    <div className='mb-6 flex justify-between items-start flex-shrink-0'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
          {title}
        </h1>
        {description && (
          <p className='text-gray-600 dark:text-gray-400'>
            {description}
          </p>
        )}
      </div>
      {actionButton}
    </div>
  )
}

export default PageHeader
