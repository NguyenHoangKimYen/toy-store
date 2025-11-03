import { useState, useEffect } from 'react'
import { mockUsers } from './mockData'

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
    // Debounce: Wait 500ms after user stops typing
    const delayTimer = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          setLoading(true)
          setError(null)
          
          // Build query parameters for backend filtering
          const params = new URLSearchParams()
          if (searchQuery) {
            params.append('search', searchQuery)
          }
          
          // ----When backend is ready----
          // const response = await fetch(`/api/users?${params.toString()}`)
          // if (!response.ok) {
          //   throw new Error(`Error: ${response.status}`)
          // }
          // const data = await response.json()
          // setUsers(data.users)
          // setStats(data.stats)
          
          // USING MOCK DATA CURRENTLY (simulating backend filtering)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Simulate server-side filtering
          let filtered = mockUsers
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = mockUsers.filter(user => 
              user.fullName.toLowerCase().includes(query) ||
              user.username.toLowerCase().includes(query) ||
              user.email.toLowerCase().includes(query) ||
              user.phone.includes(query)
            )
          }
          
          // Simulate backend calculating stats
          const calculatedStats = {
            totalUsers: filtered.length,
            verifiedUsers: filtered.filter(u => u.isVerified).length,
            totalLoyaltyPoints: filtered.reduce((sum, u) => sum + u.loyaltyPoints, 0),
            adminUsers: filtered.filter(u => u.role === 'admin').length,
          }
          
          setUsers(filtered)
          setStats(calculatedStats)
          
        } catch (err) {
          setError(err.message)
          console.error('Error fetching users:', err)
          setUsers([])
        } finally {
          setLoading(false)
        }
      }

      fetchUsers()
    }, 500) // 500ms debounce delay

    // Cleanup: Cancel the timer if user types again before 500ms
    return () => clearTimeout(delayTimer)
  }, [searchQuery]) // Re-fetch when search query changes

  return {
    users,
    stats,
    loading,
    error,
  }
}
