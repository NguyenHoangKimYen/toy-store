import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import * as usersService from '@/services/users.service'

export const useUsers = (searchQuery = '') => {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalLoyaltyPoints: 0,
    adminUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch from backend
      const data = await usersService.getUsers({ 
        search: searchQuery,
        // Add other filters as needed
        // role: 'customer',
        // isVerified: true,
        // socialProvider: 'google',
        // sortBy: 'createdAt',
        // sortOrder: 'desc',
        // page: 1,
        // No limit - fetch all users
      })
      
      // Backend returns { success: true, data: [...users] }
      const usersArray = Array.isArray(data) ? data : (data.data || [])
      
      // Calculate stats from users
      const calculatedStats = {
        totalUsers: usersArray.length,
        verifiedUsers: usersArray.filter(u => u.isVerified).length,
        totalLoyaltyPoints: usersArray.reduce((sum, u) => sum + (u.loyaltyPoints || 0), 0),
        adminUsers: usersArray.filter(u => u.role === 'admin').length,
      }
      
      setUsers(usersArray)
      setStats(calculatedStats)
      
    } catch (err) {
      setError(err.message)
      console.error('Error fetching users:', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce
    const delayTimer = setTimeout(() => {
      fetchUsers()
    }, 500) 

    // Cleanup
    return () => clearTimeout(delayTimer)
  }, [searchQuery]) 

  // Create user
  const createUser = async (userData) => {
    try {
      const newUser = await usersService.createUser(userData)
      await fetchUsers() // Refresh list
      return newUser
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      const updatedUser = await usersService.updateUser(userId, userData)
      await fetchUsers() // Refresh list
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Delete user
  const deleteUser = async (userId) => {
    try {
      await usersService.deleteUser(userId)
      await fetchUsers() // Refresh list
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
      throw error
    }
  }

  // Bulk delete users
  const bulkDeleteUsers = async (userIds) => {
    try {
      await Promise.all(userIds.map(id => usersService.deleteUser(id)))
      await fetchUsers() // Refresh list
      toast.success(`${userIds.length} user(s) deleted successfully`)
    } catch (error) {
      console.error('Error deleting users:', error)
      toast.error('Failed to delete users')
      throw error
    }
  }

  return {
    users,
    stats,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    refreshUsers: fetchUsers,
  }
}
