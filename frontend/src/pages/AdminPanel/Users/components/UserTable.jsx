import React from 'react'
import { Users, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import UserTableRow from './UserTableRow'
import { formatDate } from '@/utils/formatDate'
import { formatPhone, getRoleBadgeColor } from '../utils/formatters'

const UserTable = ({ users, onViewDetails, onEdit, onDelete }) => {
  if (users.length === 0) {
    return (
      <div className='text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg'>
        <Users className='w-16 h-16 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>No users found</h3>
        <p className='text-gray-600 dark:text-gray-400'>Try adjusting your search</p>
      </div>
    )
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
      {/* Desktop Table View - Hidden on Mobile */}
      <div className='hidden lg:block overflow-x-auto'>
        <table className='w-full min-w-max'>
          <thead className='bg-gray-50 dark:bg-gray-700'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                User
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Email
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Role
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
            {users.map((user) => (
              <UserTableRow 
                key={user._id} 
                user={user} 
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on Mobile/Tablet */}
      <div className='lg:hidden divide-y divide-gray-200 dark:divide-gray-700'>
        {users.map((user) => (
          <div key={user._id} className='p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
            {/* User Header */}
            <div className='flex items-start justify-between mb-3'>
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                <div className='flex-shrink-0 h-12 w-12'>
                  <div className='h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg'>
                    {(user.fullname || user.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                    {user.fullname || user.fullName || 'Unknown'}
                  </div>
                  <div className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                    @{user.username || 'unknown'}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            </div>

            {/* User Details Grid */}
            <div className='space-y-2 mb-3'>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-500 dark:text-gray-400 min-w-[80px]'>Email:</span>
                <span className='text-gray-900 dark:text-white truncate'>{user.email}</span>
              </div>
              {user.phone && (
                <div className='flex items-center gap-2 text-sm'>
                  <span className='text-gray-500 dark:text-gray-400 min-w-[80px]'>Phone:</span>
                  <span className='text-gray-900 dark:text-white'>{formatPhone(user.phone)}</span>
                </div>
              )}
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-500 dark:text-gray-400 min-w-[80px]'>Status:</span>
                <div className='flex items-center gap-1'>
                  {user.isVerified ? (
                    <>
                      <CheckCircle className='w-4 h-4 text-green-500' />
                      <span className='text-xs text-green-600 dark:text-green-400'>Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className='w-4 h-4 text-red-500' />
                      <span className='text-xs text-red-600 dark:text-red-400'>Unverified</span>
                    </>
                  )}
                  {user.socialProvider && (
                    <span className='text-xs text-gray-500 dark:text-gray-400 ml-1 capitalize'>
                      via {user.socialProvider}
                    </span>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-500 dark:text-gray-400 min-w-[80px]'>Points:</span>
                <div className='flex items-center gap-1'>
                  <span className='text-yellow-500'>⭐</span>
                  <span className='font-medium text-gray-900 dark:text-white'>
                    {(user.loyaltyPoints ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-500 dark:text-gray-400 min-w-[80px]'>Joined:</span>
                <span className='text-gray-900 dark:text-white'>{formatDate(user.createdAt)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700'>
              <button 
                onClick={() => onViewDetails(user)}
                className='flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors'
              >
                <Eye className='w-4 h-4' />
                View
              </button>
              <button 
                onClick={() => onEdit(user)}
                className='flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors'
              >
                <Edit className='w-4 h-4' />
                Edit
              </button>
              <button 
                onClick={() => onDelete(user._id)}
                className='flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors'
              >
                <Trash2 className='w-4 h-4' />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserTable
