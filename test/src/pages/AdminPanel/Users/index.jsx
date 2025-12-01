import React, { useState, useMemo } from 'react'
import { UserPlus, Search, Filter } from 'lucide-react'
import UserTable from './components/UserTable'
import UserStats from './components/UserStats'
import UserDetailModal from './components/UserDetailModal'
import UserFormModal from './components/UserFormModal'
import UserFilters from './components/UserFilters'
import { AdminContent } from '../components'
import { useUsers, useDebounce } from '@/hooks' // Using global hook
import { PageHeader, SearchBar, ConfirmDialog } from '@/components/common'

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 500) // Debounce search input
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [formMode, setFormMode] = useState('create') // 'create' | 'edit'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    role: 'all',
    isVerified: 'all',
    socialProvider: 'all',
    sortBy: 'newest' // Default to newest
  })

  // Build params for API call - send all filters including sortBy to backend
  const apiParams = useMemo(() => {
    const params = {
      keyword: debouncedSearch.trim() || undefined, // Backend expects 'keyword' not 'search'
      sortBy: filters.sortBy || 'newest', // Send sort to backend
    }

    // Add filters if not 'all'
    if (filters.role !== 'all') params.role = filters.role
    if (filters.isVerified !== 'all') params.isVerified = filters.isVerified
    if (filters.socialProvider !== 'all') params.socialProvider = filters.socialProvider

    return params
  }, [debouncedSearch, filters])

  // Custom hook handles data fetching and CRUD operations
  const { 
    users: fetchedUsers, 
    stats, 
    loading, 
    error,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers({ 
    params: apiParams,
    dependencies: [apiParams]
  })

  // Sorting is now done on backend
  const users = fetchedUsers

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      role: 'all',
      isVerified: 'all',
      socialProvider: 'all',
      sortBy: 'newest' // Default to newest instead of 'none'
    })
    setSearchQuery('')
  }

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

  const headerCard = (
    <div className='admin-card bg-white/85 backdrop-blur-md border border-purple-100/70 rounded-2xl shadow-[0_18px_42px_-28px_rgba(124,58,237,0.22)] p-4 sm:p-5 md:p-6'>
      <div className='flex flex-col gap-3 sm:gap-4'>
        <div className='flex flex-col gap-3'>
          <div className='space-y-1'>
            <h2 className='text-xl sm:text-2xl font-semibold text-slate-900'>User Management</h2>
            <p className='text-xs sm:text-sm text-slate-500'>Manage user accounts and permissions</p>
          </div>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
            <label className='flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/85 border border-purple-100/80 shadow-inner backdrop-blur-sm'>
              <Search className='w-4 h-4 text-slate-400 flex-shrink-0' />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search users...'
                className='w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400'
              />
            </label>
            <div className='flex gap-2'>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className='px-3 py-2 rounded-xl border border-purple-100/80 bg-white/80 text-slate-700 hover:bg-purple-50 transition flex items-center gap-2'
              >
                <Filter className='w-4 h-4' />
                <span className='hidden sm:inline'>Filter</span>
              </button>
              <button 
                onClick={handleAddUser}
                className='px-3 py-2 rounded-xl border border-purple-100/80 bg-white/80 text-slate-700 hover:bg-purple-50 transition flex items-center gap-2'
              >
                <UserPlus className='w-4 h-4' />
                <span className='hidden sm:inline'>Add</span>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className='pt-3 border-t border-purple-100/60'>
            <UserFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              showFilters={showFilters}
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <AdminContent
        header={headerCard}
        filters={null}
        stats={<UserStats stats={stats} />}
        loading={loading}
        error={error}
        onRetry={() => window.location.reload()}
      >
        <UserTable 
          users={users} 
          onViewDetails={handleViewDetails}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      </AdminContent>

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
    </>
  )
}

export default Users
