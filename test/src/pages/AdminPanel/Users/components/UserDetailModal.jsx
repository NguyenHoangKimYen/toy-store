import React from 'react'
import { X, Mail, Phone, Calendar, Award, Shield, CheckCircle, XCircle } from 'lucide-react'
import { formatDateTime, formatPhone, getRoleBadgeColor } from '../utils/formatters'

const UserDetailModal = ({ user, onClose, onEdit, onDelete }) => {
  const handleEdit = () => {
    onEdit(user)
  }

  const handleDelete = () => {
    onDelete(user._id)
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>User Details</h2>
          <button 
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* User Avatar & Name */}
          <div className='flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700'>
            <div className='flex-shrink-0 h-20 w-20'>
              <div className='h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold'>
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className='flex-1'>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-1'>
                {user.fullName}
              </h3>
              <p className='text-gray-500 dark:text-gray-400 mb-2'>@{user.username}</p>
              <div className='flex gap-2 items-center'>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
                {user.isVerified ? (
                  <span className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full dark:bg-green-900 dark:text-green-200'>
                    <CheckCircle className='w-4 h-4' />
                    Verified
                  </span>
                ) : (
                  <span className='flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full dark:bg-red-900 dark:text-red-200'>
                    <XCircle className='w-4 h-4' />
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className='mb-6'>
            <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Contact Information</h4>
            <div className='space-y-3'>
              <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <Mail className='w-5 h-5 text-gray-500 dark:text-gray-400' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Email</p>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>{user.email}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <Phone className='w-5 h-5 text-gray-500 dark:text-gray-400' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Phone</p>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>{formatPhone(user.phone)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className='mb-6'>
            <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Account Details</h4>
            <div className='grid grid-cols-2 gap-4'>
              <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <div className='flex items-center gap-2 mb-2'>
                  <Award className='w-5 h-5 text-yellow-500' />
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>Loyalty Points</p>
                </div>
                <p className='text-2xl font-bold text-yellow-600'>{user.loyaltyPoints.toLocaleString()}</p>
              </div>
              <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <div className='flex items-center gap-2 mb-2'>
                  <Shield className='w-5 h-5 text-purple-500' />
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>Role</p>
                </div>
                <p className='text-2xl font-bold text-purple-600 capitalize'>{user.role}</p>
              </div>
            </div>
          </div>

          {/* Social Login */}
          {user.socialProvider && (
            <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
              <p className='text-sm font-medium text-blue-900 dark:text-blue-200 mb-1'>
                Social Login
              </p>
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                Connected via <span className='font-semibold capitalize'>{user.socialProvider}</span>
              </p>
              <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
                ID: {user.socialId}
              </p>
            </div>
          )}

          {/* Default Address */}
          {user.defaultAddressId && (
            <div className='mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'>
              <p className='text-sm font-medium text-green-900 dark:text-green-200 mb-2'>
                Default Address
              </p>
              {typeof user.defaultAddressId === 'object' && user.defaultAddressId.addressLine ? (
                <>
                  <p className='text-sm text-green-700 dark:text-green-300'>
                    {user.defaultAddressId.addressLine}
                  </p>
                  {user.defaultAddressId.city && (
                    <p className='text-sm text-green-600 dark:text-green-400 mt-1'>
                      {user.defaultAddressId.city}
                      {user.defaultAddressId.postalCode && `, ${user.defaultAddressId.postalCode}`}
                    </p>
                  )}
                  {user.defaultAddressId.phone && (
                    <p className='text-xs text-green-600 dark:text-green-400 mt-1'>
                      Phone: {user.defaultAddressId.phone}
                    </p>
                  )}
                </>
              ) : (
                <p className='text-sm text-green-700 dark:text-green-300'>
                  Address ID: {typeof user.defaultAddressId === 'string' ? user.defaultAddressId : user.defaultAddressId._id || 'N/A'}
                </p>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <Calendar className='w-5 h-5 text-gray-500 dark:text-gray-400' />
                <p className='text-sm font-medium text-gray-900 dark:text-white'>Joined</p>
              </div>
              <p className='text-sm text-gray-700 dark:text-gray-300'>{formatDateTime(user.createdAt)}</p>
            </div>
            <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <Calendar className='w-5 h-5 text-gray-500 dark:text-gray-400' />
                <p className='text-sm font-medium text-gray-900 dark:text-white'>Last Updated</p>
              </div>
              <p className='text-sm text-gray-700 dark:text-gray-300'>{formatDateTime(user.updatedAt)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
            <button 
              onClick={handleEdit}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              Edit User
            </button>
            <button 
              onClick={handleDelete}
              className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium'
            >
              Delete User
            </button>
            <button 
              onClick={onClose}
              className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium dark:bg-gray-600 dark:text-gray-200'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal
