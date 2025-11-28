import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Package, Search, Filter, Truck, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { getAllOrders, updateOrderStatus } from '@/services/orders.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice } from '@/utils/formatPrice'
import OrderDetailModal from './components/OrderDetailModal'
import OrderFilters from './components/OrderFilters'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await getAllOrders()
      // Backend returns { success: true, orders: [...] }
      setOrders(response?.orders || [])
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders'
      if (errorMessage.includes('Invalid token') || errorMessage.includes('401')) {
        toast.error('Session expired. Please login again.')
      } else {
        toast.error('Failed to fetch orders: ' + errorMessage)
      }
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      toast.success('Order status updated successfully')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update order status: ' + error.message)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      confirmed: { variant: 'default', icon: CheckCircle, label: 'Confirmed' },
      shipping: { variant: 'default', icon: Truck, label: 'Shipping' },
      delivered: { variant: 'default', icon: CheckCircle, label: 'Delivered' },
      cancelled: { variant: 'destructive', icon: XCircle, label: 'Cancelled' },
      returned: { variant: 'destructive', icon: XCircle, label: 'Returned' },
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    )
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesDeliveryType = deliveryTypeFilter === 'all' || order.deliveryType === deliveryTypeFilter
    const matchesPaymentMethod = paymentMethodFilter === 'all' || order.paymentMethod === paymentMethodFilter

    return matchesSearch && matchesStatus && matchesDeliveryType && matchesPaymentMethod
  })

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 sm:w-8 sm:h-8" />
            Orders Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage and track all customer orders
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search by order ID, customer, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 text-sm"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 text-sm"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <OrderFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            deliveryTypeFilter={deliveryTypeFilter}
            setDeliveryTypeFilter={setDeliveryTypeFilter}
            paymentMethodFilter={paymentMethodFilter}
            setPaymentMethodFilter={setPaymentMethodFilter}
          />
        )}

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const addressData = typeof order.addressId === 'object' ? order.addressId : null;
                return (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs sm:text-sm font-semibold">
                            #{order._id.slice(-8)}
                          </span>
                          {getStatusBadge(order.status)}
                          {/* Delivery Type Badge */}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Truck size={12} />
                            {order.deliveryType === 'express' ? 'Express' : 'Standard'}
                          </Badge>
                          {/* Payment Method Badge */}
                          {order.paymentMethod && (
                            <Badge variant="outline" className="flex items-center gap-1 capitalize">
                              {order.paymentMethod === 'cashondelivery' ? 'COD' : order.paymentMethod}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                          <p className="truncate"><strong>Customer:</strong> {order.userId?.fullName || 'Guest'}</p>
                          <p className="truncate"><strong>Email:</strong> {order.userId?.email || 'N/A'}</p>
                          {addressData && (
                            <p className="truncate"><strong>Address:</strong> {addressData.addressLine || 'N/A'}</p>
                          )}
                          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-bold">
                            {formatPrice(order.totalAmount?.$numberDecimal || order.totalAmount || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Shipping: {formatPrice(order.shippingFee?.$numberDecimal || order.shippingFee || 0)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowDetailModal(true)
                            }}
                            className="text-xs sm:text-sm"
                          >
                            <Eye size={14} className="mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          {/* Status Select Dropdown */}
                          <Select 
                            value={order.status} 
                            onValueChange={(newStatus) => handleStatusUpdate(order._id, newStatus)}
                          >
                            <SelectTrigger className="h-8 text-xs sm:text-sm w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="shipping">Shipping</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="returned">Returned</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            </div>
          )}
        </CardContent>
      </Card>

      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedOrder(null)
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}

export default Orders
