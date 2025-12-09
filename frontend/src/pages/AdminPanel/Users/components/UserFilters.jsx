import React, { useState, useEffect } from 'react'
import { X, Shield, CheckCircle, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { getUsers } from '@/services/users.service'

const UserFilters = ({ filters, onFilterChange, onClearFilters, showFilters }) => {
  const [availableRoles, setAvailableRoles] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [availableProviders, setAvailableProviders] = useState([])
  const [loadingProviders, setLoadingProviders] = useState(true)

  // Fetch all unique roles from database
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true)
        // Fetch a large sample to get all role types
        const response = await getUsers({ limit: 1000 })
        const users = response.users || response || []
        
        // Extract unique roles
        const rolesSet = new Set()
        users.forEach(user => {
          if (user.role) {
            rolesSet.add(user.role)
          }
        })
        
        // Convert to array with labels
        const roles = Array.from(rolesSet).map(role => ({
          value: role,
          label: role.charAt(0).toUpperCase() + role.slice(1)
        }))
        
        setAvailableRoles(roles)
      } catch (error) {
        console.error('Failed to fetch roles:', error)
        // Fallback to default roles if fetch fails
        setAvailableRoles([
          { value: 'customer', label: 'Customer' },
          { value: 'admin', label: 'Admin' },
        ])
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [])

  // Fetch all unique social providers from database
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoadingProviders(true)
        const response = await getUsers({ limit: 1000 })
        const users = response.users || response || []
        
        // Extract unique social providers
        const providersSet = new Set()
        users.forEach(user => {
          if (user.socialProvider) {
            providersSet.add(user.socialProvider)
          } else {
            providersSet.add('local')
          }
        })
        
        // Convert to array with labels
        const providers = Array.from(providersSet).map(provider => ({
          value: provider,
          label: provider === 'local' ? 'Email/Password' : provider.charAt(0).toUpperCase() + provider.slice(1)
        }))
        
        setAvailableProviders(providers)
      } catch (error) {
        console.error('Failed to fetch social providers:', error)
        // Fallback to default providers
        setAvailableProviders([
          { value: 'local', label: 'Email/Password' },
          { value: 'google', label: 'Google' },
          { value: 'facebook', label: 'Facebook' },
        ])
      } finally {
        setLoadingProviders(false)
      }
    }

    fetchProviders()
  }, [])

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'sortBy') return value && value !== 'none'
    return value && value !== 'all'
  })

  return (
    <div className='mb-4'>
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className='flex justify-end mb-2'>
          <Button
            variant='ghost'
            onClick={onClearFilters}
            className='flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50'
          >
            <X className='w-4 h-4' />
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className='p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4 mb-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
            
            {/* Role Filter */}
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-medium'>
                <Shield className='w-4 h-4' />
                Role
              </Label>
              <Select 
                value={filters.role || 'all'} 
                onValueChange={(v) => handleChange('role', v)}
                disabled={loadingRoles}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingRoles ? 'Loading roles...' : 'All Roles'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Roles</SelectItem>
                  {availableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verification Status Filter */}
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-medium'>
                <CheckCircle className='w-4 h-4' />
                Verification Status
              </Label>
              <Select value={filters.isVerified || 'all'} onValueChange={(v) => handleChange('isVerified', v)}>
                <SelectTrigger>
                  <SelectValue placeholder='All Users' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Users</SelectItem>
                  <SelectItem value='true'>Verified Only</SelectItem>
                  <SelectItem value='false'>Unverified Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Social Provider Filter */}
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-medium'>
                <Shield className='w-4 h-4' />
                Login Method
              </Label>
              <Select 
                value={filters.socialProvider || 'all'} 
                onValueChange={(v) => handleChange('socialProvider', v)}
                disabled={loadingProviders}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProviders ? 'Loading...' : 'All Methods'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Methods</SelectItem>
                  {availableProviders.map(provider => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort by Loyalty Points */}
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-medium'>
                <ArrowUpDown className='w-4 h-4' />
                Sort By
              </Label>
              <Select 
                value={filters.sortBy || 'none'} 
                onValueChange={(v) => handleChange('sortBy', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='No Sorting' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>No Sorting</SelectItem>
                  <SelectItem value='newest'>Newest First</SelectItem>
                  <SelectItem value='oldest'>Oldest First</SelectItem>
                  <SelectItem value='points-high'>Highest Points First</SelectItem>
                  <SelectItem value='points-low'>Lowest Points First</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className='pt-4 border-t border-gray-300'>
              <div className='flex flex-wrap gap-2'>
                <span className='text-sm font-medium text-gray-700'>Active Filters:</span>
                {filters.role && filters.role !== 'all' && (
                  <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize'>
                    Role: {filters.role}
                  </span>
                )}
                {filters.isVerified && filters.isVerified !== 'all' && (
                  <span className='px-2 py-1 bg-green-100 text-green-700 rounded text-xs'>
                    {filters.isVerified === 'true' ? 'Verified' : 'Unverified'}
                  </span>
                )}
                {filters.socialProvider && filters.socialProvider !== 'all' && (
                  <span className='px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs capitalize'>
                    Login: {filters.socialProvider === 'local' ? 'Email/Password' : filters.socialProvider}
                  </span>
                )}
                {filters.sortBy && filters.sortBy !== 'none' && (
                  <span className='px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs'>
                    Sort: {filters.sortBy === 'newest' ? 'Newest First' : filters.sortBy === 'oldest' ? 'Oldest First' : filters.sortBy === 'points-high' ? 'Highest Points' : 'Lowest Points'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserFilters
