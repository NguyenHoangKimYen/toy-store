import React, { useState } from 'react'
import { Search, Filter, UserPlus } from 'lucide-react'
import UserTable from './components/UserTable'
import UserStats from './components/UserStats'
import UserDetailModal from './components/UserDetailModal'
import { useUsers } from './hooks/useUsers'
import { LoadingSpinner, ErrorMessage } from '@/components/common'

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Custom hook handles data fetching and filtering
  const { users, stats, loading, error } = useUsers(searchQuery)

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  return (
    <div className='h-full flex flex-col p-6'>
      {/* Header - Fixed */}
      <div className='mb-6 flex justify-between items-start flex-shrink-0'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            User Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage user accounts and permissions
          </p>
        </div>
        <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
          <UserPlus className='w-4 h-4' />
          Add User
        </button>
      </div>

      {/* Search and Filters - Fixed */}
      <div className='flex gap-4 mb-6 flex-shrink-0'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            placeholder='Search by name, username, email, or phone...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
          />
        </div>
        <button className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white'>
          <Filter className='w-4 h-4' />
          Filters
        </button>
      </div>

      {/* Stats Cards - Fixed */}
      <div className='flex-shrink-0 mb-6'>
        <UserStats stats={stats} />
      </div>

      {/* Error State */}
      {error && (
        <div className='flex-shrink-0 mb-6'>
          <ErrorMessage 
            title='Error Loading Users'
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* User Table - Scrollable */}
      <div className='flex-1 overflow-y-auto'>
        {loading ? (
          <LoadingSpinner message='Loading users...' />
        ) : (
          <UserTable 
            users={users} 
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  )
}

export default Users
