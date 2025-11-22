import React, { useState, useEffect } from 'react'
import { X, Package, MapPin, CreditCard, Tag } from 'lucide-react'
import { getOrderById } from '@/services/orders.service'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState(order.status)

  useEffect(() => {
    fetchOrderDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order._id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await getOrderById(order._id)
      setOrderDetails(response.order)
    } catch {
      toast.error('Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (newStatus !== order.status) {
      await onStatusUpdate(order._id, newStatus)
      onClose()
    }
  }

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">Loading order details...</div>
        </DialogContent>
      </Dialog>
    )
  }

  const orderData = orderDetails || order

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package />
            Order #{orderData._id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Order Status</h3>
            <div className="flex items-center gap-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-[200px]">
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
              {newStatus !== order.status && (
                <Button onClick={handleUpdateStatus} size="sm">
                  Update Status
                </Button>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <p className="text-sm"><strong>Name:</strong> {orderData.userId?.fullname || 'Guest'}</p>
            <p className="text-sm"><strong>Email:</strong> {orderData.userId?.email || 'N/A'}</p>
            <p className="text-sm"><strong>Phone:</strong> {orderData.userId?.phone || 'N/A'}</p>
          </div>

          {/* Delivery Address */}
          {orderData.addressId && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin size={18} />
                Delivery Address
              </h3>
              <p className="text-sm">
                {typeof orderData.addressId === 'object' 
                  ? `${orderData.addressId.street}, ${orderData.addressId.city}, ${orderData.addressId.state} ${orderData.addressId.zipCode}`
                  : 'Address details not available'}
              </p>
            </div>
          )}

          {/* Order Items */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {orderData.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{item.productId?.name || 'Product'}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ${parseFloat(item.subtotal?.$numberDecimal || item.subtotal || 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CreditCard size={18} />
              Payment Summary
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Delivery Type:</span>
                <span className="font-medium">{orderData.deliveryType === 'express' ? 'Express' : 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-medium">${parseFloat(orderData.shippingFee || 0).toFixed(2)}</span>
              </div>
              {orderData.discountCodeId && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    Discount Applied:
                  </span>
                  <span className="font-medium">
                    {typeof orderData.discountCodeId === 'object' 
                      ? orderData.discountCodeId.code 
                      : 'Discount'}
                  </span>
                </div>
              )}
              {orderData.pointsUsed > 0 && (
                <div className="flex justify-between">
                  <span>Points Used:</span>
                  <span className="font-medium">{orderData.pointsUsed} pts</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Total:</span>
                <span>${parseFloat(orderData.totalAmount?.$numberDecimal || orderData.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Date */}
          <div className="text-sm text-muted-foreground">
            <p><strong>Order Date:</strong> {new Date(orderData.createdAt).toLocaleString()}</p>
            {orderData.updatedAt && (
              <p><strong>Last Updated:</strong> {new Date(orderData.updatedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OrderDetailModal
