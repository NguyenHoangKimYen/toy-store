import React, { useState, useEffect } from 'react'
import { X, Package, MapPin, CreditCard, Tag } from 'lucide-react'
import { getOrderById } from '@/services/orders.service'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { formatPrice } from '@/utils/formatPrice'
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
      // Backend returns { success: true, order: {...} }
      setOrderDetails(response?.order || null)
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
            <p className="text-sm"><strong>Name:</strong> {orderData.userId?.fullName || 'Guest'}</p>
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
              <div className="text-sm space-y-1">
                {typeof orderData.addressId === 'object' ? (
                  <>
                    <p><strong>Recipient:</strong> {orderData.addressId.fullNameOfReceiver || 'N/A'}</p>
                    <p><strong>Phone:</strong> {orderData.addressId.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {orderData.addressId.addressLine || 'N/A'}</p>
                    {orderData.addressId.lat && orderData.addressId.lng && (
                      <p><strong>Coordinates:</strong> {orderData.addressId.lat}, {orderData.addressId.lng}</p>
                    )}
                  </>
                ) : (
                  <p>Address details not available</p>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {orderData.items?.map((item, index) => {
                const itemSubtotal = item.subtotal?.$numberDecimal 
                  ? parseFloat(item.subtotal.$numberDecimal) 
                  : parseFloat(item.subtotal || 0);
                
                return (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{item.productId?.name || 'Product'}</p>
                      {item.variantId && (
                        <p className="text-xs text-muted-foreground">
                          Variant: {item.variantId.color || ''} {item.variantId.size || ''}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(itemSubtotal)}</p>
                  </div>
                );
              })}
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
                <span className="font-medium">
                  {formatPrice(orderData.shippingFee?.$numberDecimal || orderData.shippingFee || 0)}
                </span>
              </div>
              {orderData.discountAmount && parseFloat(orderData.discountAmount?.$numberDecimal || orderData.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    Discount Code:
                  </span>
                  <span className="font-medium">
                    -{formatPrice(orderData.discountAmount?.$numberDecimal || orderData.discountAmount || 0)}
                  </span>
                </div>
              )}
              {orderData.voucherDiscount && parseFloat(orderData.voucherDiscount?.$numberDecimal || orderData.voucherDiscount || 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    Voucher Discount:
                  </span>
                  <span className="font-medium">
                    -{formatPrice(orderData.voucherDiscount?.$numberDecimal || orderData.voucherDiscount || 0)}
                  </span>
                </div>
              )}
              {orderData.pointsUsed > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Points Used:</span>
                  <span className="font-medium">{orderData.pointsUsed} pts (-{formatPrice(orderData.pointsUsed)})</span>
                </div>
              )}
              {orderData.pointsEarned > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Points Earned:</span>
                  <span className="font-medium">+{orderData.pointsEarned} pts</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Total:</span>
                <span>
                  {formatPrice(orderData.totalAmount?.$numberDecimal || orderData.totalAmount || 0)}
                </span>
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
