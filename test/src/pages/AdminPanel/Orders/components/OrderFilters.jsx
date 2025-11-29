import React from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const OrderFilters = ({ 
  statusFilter, 
  setStatusFilter,
  deliveryTypeFilter,
  setDeliveryTypeFilter,
  paymentMethodFilter,
  setPaymentMethodFilter
}) => {
  return (
    <div className="border-t pt-3 sm:pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Status Filter */}
        <div>
          <Label className="text-xs sm:text-sm">Order Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipping">Shipping</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Delivery Type Filter */}
        <div>
          <Label className="text-xs sm:text-sm">Shipping Method</Label>
          <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="express">Express</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method Filter */}
        <div>
          <Label className="text-xs sm:text-sm">Payment Method</Label>
          <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="cashondelivery">Cash on Delivery</SelectItem>
              <SelectItem value="momo">MoMo</SelectItem>
              <SelectItem value="zalopay">ZaloPay</SelectItem>
              <SelectItem value="vietqr">VietQR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter('all')
              setDeliveryTypeFilter('all')
              setPaymentMethodFilter('all')
            }}
            className="w-full text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderFilters
