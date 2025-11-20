import React, { useState } from 'react'
import { UserPlus } from 'lucide-react'
import UserTable from './components/UserTable'
import UserStats from './components/UserStats'
import UserDetailModal from './components/UserDetailModal'
import UserFormModal from './components/UserFormModal'
import { useUsers } from '@/hooks' // Using global hook
import { PageHeader, SearchBar, ScrollableContent, ConfirmDialog } from '@/components/common'

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [formMode, setFormMode] = useState('create') // 'create' | 'edit'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  // Custom hook handles data fetching and CRUD operations
  const { 
    users, 
    stats, 
    loading, 
    error,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers({ searchQuery })

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setFormMode('create')
    setIsFormModalOpen(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setFormMode('edit')
    setIsFormModalOpen(true)
  }

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete)
        setIsDetailModalOpen(false)
        setShowDeleteConfirm(false)
        setUserToDelete(null)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleSaveUser = async (userData) => {
    // Clean up data before sending to backend
    const cleanedData = { ...userData }
    
    // Remove empty socialProvider (backend validation doesn't accept empty string)
    if (cleanedData.socialProvider === '') {
      delete cleanedData.socialProvider
    }
    
    if (formMode === 'create') {
      await createUser(cleanedData)
    } else {
      // For updates, handle password separately if provided
      const { password, confirmPassword, ...userDataWithoutPassword } = cleanedData
      
      // Update user fields (without password)
      await updateUser(selectedUser._id, userDataWithoutPassword)
      
      // If password was provided, update it separately using setUserPassword endpoint
      if (password) {
        const usersService = await import('@/services/users.service')
        await usersService.setUserPassword(selectedUser._id, { password, confirmPassword })
      }
    }
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedUser(null)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setSelectedUser(null)
  }

  return (
    <div className='h-full flex flex-col p-6'>
      {/* Header */}
      <PageHeader
        title='User Management'
        description='Manage user accounts and permissions'
        actionButton={
          <button 
            onClick={handleAddUser}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
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
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      </ScrollableContent>

      {/* User Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={handleCloseDetailModal}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}

      {/* User Form Modal */}
      <UserFormModal
        user={selectedUser}
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSaveUser}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

export default Users
