import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { getOrdersByDiscountCode } from '@/services/orders.service';
import { formatPrice } from '@/utils/formatPrice';

const DiscountOrdersModal = ({ discountCode, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrdersByDiscountCode(discountCode._id);
        setOrders(response.data || response.orders || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (discountCode?._id) {
      fetchOrders();
    }
  }, [discountCode]);

  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'destructive',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Orders Using Code: {discountCode.code}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Total orders: {orders.length} | Discount: {formatPrice(discountCode.value?.$numberDecimal || discountCode.value)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found using this discount code</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">Order #{order.orderNumber || order._id.slice(-8)}</h3>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User size={16} />
                          <span>{order.userId?.fullName || order.userId?.email || 'Guest'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={16} />
                          <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign size={16} />
                          <span>Total: {formatPrice(order.finalAmount || order.totalAmount)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Package size={16} />
                          <span>{order.items?.length || 0} items</span>
                        </div>
                      </div>

                      {order.discountAmount > 0 && (
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            Discount Applied: -{formatPrice(order.discountAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
};

export default DiscountOrdersModal;
