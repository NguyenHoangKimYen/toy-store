import { useState, useEffect } from 'react'
import { getUsers } from '@/services/users.service'

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

  useEffect(() => {
    // Debounce
    const delayTimer = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          setLoading(true)
          setError(null)
          
          // Fetch from backend
          const data = await getUsers({ 
            search: searchQuery,
            // Add other filters as needed
            // role: 'customer',
            // verified: true,
            // hasSocialLogin: false,
            // sortBy: 'createdAt',
            // sortOrder: 'desc',
            // page: 1,
            // limit: 50
          })
          
          // Backend can return array or object with users property
          const usersArray = Array.isArray(data) ? data : data.users || []
          
          // Calculate stats from users
          const calculatedStats = {
            totalUsers: usersArray.length,
            verifiedUsers: usersArray.filter(u => u.isVerified).length,
            totalLoyaltyPoints: usersArray.reduce((sum, u) => sum + (u.loyaltyPoints || 0), 0),
            adminUsers: usersArray.filter(u => u.role === 'admin').length,
          }
          
          setUsers(usersArray)
          setStats(data.stats || calculatedStats)
          
        } catch (err) {
          setError(err.message)
          console.error('Error fetching users:', err)
          setUsers([])
        } finally {
          setLoading(false)
        }
      }

      fetchUsers()
    }, 500) 

    // Cleanup
    return () => clearTimeout(delayTimer)
  }, [searchQuery]) 

  return {
    users,
    stats,
    loading,
    error,
  }
}
