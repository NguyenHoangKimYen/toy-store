import React, { useState } from 'react'
import { UserPlus } from 'lucide-react'
import UserTable from './components/UserTable'
import UserStats from './components/UserStats'
import UserDetailModal from './components/UserDetailModal'
import { useUsers } from './hooks/useUsers'
import { PageHeader, SearchBar, ScrollableContent } from '@/components/common'

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
      {/* Header */}
      <PageHeader
        title='User Management'
        description='Manage user accounts and permissions'
        actionButton={
          <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
            <UserPlus className='w-4 h-4' />
            Add User
          </button>
        }
      />

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder='Search by name, username, email, or phone...'
      />

      {/* Stats Cards */}
      <div className='flex-shrink-0 mb-6'>
        <UserStats stats={stats} />
      </div>

      {/* User Table */}
      <ScrollableContent
        loading={loading}
        error={error}
        loadingMessage='Loading users...'
        errorTitle='Error Loading Users'
        onRetry={() => window.location.reload()}
      >
        <UserTable 
          users={users} 
          onViewDetails={handleViewDetails}
        />
      </ScrollableContent>

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
