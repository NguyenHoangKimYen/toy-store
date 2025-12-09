import React from 'react'
import { Users, UserCheck, Award, Shield } from 'lucide-react'

const formatCompact = (value) => {
  if (value === null || value === undefined) return '0';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return value.toString();
};

const UserStats = ({ stats }) => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      {/* Total Users */}
      <div className='bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>Total Users</p>
            <p className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>{stats.totalUsers}</p>
          </div>
          <Users className='w-7 h-7 sm:w-8 sm:h-8 text-blue-500' />
        </div>
      </div>

      {/* Verified Users */}
      <div className='bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>Verified</p>
            <p className='text-xl sm:text-2xl font-bold text-green-600'>{stats.verifiedUsers}</p>
          </div>
          <UserCheck className='w-7 h-7 sm:w-8 sm:h-8 text-green-500' />
        </div>
      </div>

      {/* Total Loyalty Points */}
      <div className='bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>Total Points</p>
            <p className='text-xl sm:text-2xl font-bold text-yellow-600'>
              {formatCompact(stats.totalLoyaltyPoints)}
            </p>
          </div>
          <Award className='w-7 h-7 sm:w-8 sm:h-8 text-yellow-500' />
        </div>
      </div>

      {/* Admin Users */}
      <div className='bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>Admins</p>
            <p className='text-xl sm:text-2xl font-bold text-purple-600'>{stats.adminUsers}</p>
          </div>
          <Shield className='w-7 h-7 sm:w-8 sm:h-8 text-purple-500' />
        </div>
      </div>
    </div>
  )
}

export default UserStats
