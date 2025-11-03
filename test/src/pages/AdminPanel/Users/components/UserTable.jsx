import React from 'react'
import { Users } from 'lucide-react'
import UserTableRow from './UserTableRow'

const UserTable = ({ users, onViewDetails }) => {
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
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 dark:bg-gray-700'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                User
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Contact
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Role
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Points
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Joined
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
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserTable
