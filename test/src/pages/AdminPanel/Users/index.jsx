import React, { useState } from 'react'
import { Search, Filter, UserPlus } from 'lucide-react'
import UserTable from './components/UserTable'
import UserStats from './components/UserStats'
import UserDetailModal from './components/UserDetailModal'
import { useUsers } from './hooks/useUsers'

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
    <div className='p-6'>
      {/* Header */}
      <div className='mb-6 flex justify-between items-start'>
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

      {/* Search and Filters */}
      <div className='flex gap-4 mb-6'>
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

      {/* Stats Cards */}
      <UserStats stats={stats} />

      {/* Error State */}
      {error && (
        <div className='text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6'>
          <div className='text-red-500 text-5xl mb-4'>⚠️</div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
            Error Loading Users
          </h3>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Retry
          </button>
        </div>
      )}

      {/* User Table with Loading State */}
      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600 dark:text-gray-400'>Loading users...</p>
          </div>
        </div>
      ) : (
        <UserTable 
          users={users} 
          onViewDetails={handleViewDetails}
        />
      )}

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
