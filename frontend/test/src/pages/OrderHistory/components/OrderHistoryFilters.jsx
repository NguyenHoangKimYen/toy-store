import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMyOrders } from '@/services/orders.service';
import './OrderHistoryFilters.css';

const OrderHistoryFilters = ({ filters, onFilterChange, onSearch }) => {
  const [availableStatuses, setAvailableStatuses] = useState([])
  const [loadingStatuses, setLoadingStatuses] = useState(true)

  // Fetch all unique order statuses from database
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoadingStatuses(true)
        const response = await getMyOrders({ limit: 1000 })
        const orders = response?.orders || []
        
        // Extract unique statuses
        const statusesSet = new Set()
        orders.forEach(order => {
          if (order.status) {
            statusesSet.add(order.status)
          }
        })
        
        // Convert to array and capitalize
        const statuses = Array.from(statusesSet).map(status => ({
          value: status.toLowerCase(),
          label: status.charAt(0).toUpperCase() + status.slice(1)
        }))
        
        setAvailableStatuses(statuses)
      } catch (error) {
        console.error('Failed to fetch order statuses:', error)
        // Fallback to default statuses based on backend model
        setAvailableStatuses([
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'shipping', label: 'Shipping' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'returned', label: 'Returned' },
        ])
      } finally {
        setLoadingStatuses(false)
      }
    }

    fetchStatuses()
  }, [])

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="order-history-filters">
      <div className="filter-search">
        <Search className="search-icon" size={20} />
        <Input
          type="text"
          placeholder="Search orders..."
          value={filters.search}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <div className="filter-controls">
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange('status', value)}
          disabled={loadingStatuses}
        >
          <SelectTrigger className="filter-select">
            <SelectValue placeholder={loadingStatuses ? 'Loading...' : 'All Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {availableStatuses.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFilterChange('sortBy', value)}
        >
          <SelectTrigger className="filter-select">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="total-desc">Highest Amount</SelectItem>
            <SelectItem value="total-asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default OrderHistoryFilters;
