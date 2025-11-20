import React from 'react'
import { Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/utils/formatDate'
import { formatPhone, getRoleBadgeColor } from '../utils/formatters'

const UserTableRow = ({ user, onViewDetails, onEdit, onDelete }) => {
  return (
    <tr className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
      {/* User Info */}
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center'>
          <div className='flex-shrink-0 h-10 w-10'>
            <div className='h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold'>
              {(user.fullname || user.fullName || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
          <div className='ml-4'>
            <div className='text-sm font-medium text-gray-900 dark:text-white'>
              {user.fullname || user.fullName || 'Unknown'}
            </div>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              @{user.username || 'unknown'}
            </div>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='text-sm text-gray-900 dark:text-white'>{user.email}</div>
        <div className='text-sm text-gray-500 dark:text-gray-400'>{formatPhone(user.phone)}</div>
      </td>

      {/* Role */}
      <td className='px-6 py-4 whitespace-nowrap'>
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
          {user.role}
        </span>
      </td>

      {/* Status */}
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center gap-2'>
          {user.isVerified ? (
            <>
              <CheckCircle className='w-5 h-5 text-green-500' />
              <span className='text-sm text-green-600 dark:text-green-400'>Verified</span>
            </>
          ) : (
            <>
              <XCircle className='w-5 h-5 text-red-500' />
              <span className='text-sm text-red-600 dark:text-red-400'>Unverified</span>
            </>
          )}
        </div>
        {user.socialProvider && (
          <span className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
            via {user.socialProvider}
          </span>
        )}
      </td>

      {/* Loyalty Points */}
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center gap-1'>
          <span className='text-yellow-500'>⭐</span>
          <span className='text-sm font-medium text-gray-900 dark:text-white'>
            {user.loyaltyPoints.toLocaleString()}
          </span>
        </div>
      </td>

      {/* Joined Date */}
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
        {formatDate(user.createdAt)}
      </td>

      {/* Actions */}
      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
        <div className='flex gap-2 justify-end'>
          <button 
            onClick={() => onViewDetails(user)}
            className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
            title='View Details'
          >
            <Eye className='w-5 h-5' />
          </button>
          <button 
            onClick={() => onEdit(user)}
            className='text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
            title='Edit User'
          >
            <Edit className='w-5 h-5' />
          </button>
          <button 
            onClick={() => onDelete(user._id)}
            className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
            title='Delete User'
          >
            <Trash2 className='w-5 h-5' />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default UserTableRow
