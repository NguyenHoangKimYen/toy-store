import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronLeft, Package, MapPin, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { useOrders } from '@/hooks';
import { formatPrice } from '@/utils';
import { ROUTES } from '@/config/routes';
import './OrderDetail.css';

const statusConfig = {
  pending: { label: 'Pending', color: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'info', icon: Package },
  shipping: { label: 'Shipping', color: 'primary', icon: Package },
  delivered: { label: 'Delivered', color: 'success', icon: Package },
  cancelled: { label: 'Cancelled', color: 'danger', icon: Package },
  returned: { label: 'Returned', color: 'danger', icon: Package },
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrder, loading, error, fetchOrderById, cancelCurrentOrder } = useOrders();

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await cancelCurrentOrder(id);
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  if (loading) {
    return (
      <div className="order-detail-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="order-detail-error">
        <ErrorMessage message={error || 'Order not found'} />
        <Button onClick={() => navigate(ROUTES.ORDER_HISTORY)}>Back to Orders</Button>
      </div>
    );
  }

  const order = currentOrder;
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="order-detail-container">
      {/* Header */}
      <div className="order-detail-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.ORDER_HISTORY)}
          className="back-button"
        >
          <ChevronLeft size={20} />
          Back to Orders
        </Button>
        <div className="order-header-info">
          <h1>Order #{order.id}</h1>
          <div className={`order-status status-${status.color}`}>
            <StatusIcon size={16} />
            <span>{status.label}</span>
          </div>
        </div>
      </div>

      <div className="order-detail-content">
        {/* Order Info Card */}
        <div className="order-info-card">
          <h2>Order Information</h2>
          <div className="order-info-grid">
            <div className="info-item">
              <span className="info-label">Order Date</span>
              <span className="info-value">{format(new Date(order.createdAt), 'PPp')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className={`info-value status-${status.color}`}>{status.label}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Amount</span>
              <span className="info-value">{formatPrice(order.totalAmount)}</span>
            </div>
            {order.pointsUsed > 0 && (
              <div className="info-item">
                <span className="info-label">Points Used</span>
                <span className="info-value">{order.pointsUsed} pts</span>
              </div>
            )}
            {order.pointsEarned > 0 && (
              <div className="info-item">
                <span className="info-label">Points Earned</span>
                <span className="info-value">+{order.pointsEarned} pts</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Address Card */}
        {order.address && (
          <div className="order-info-card">
            <h2>
              <MapPin size={20} />
              Delivery Address
            </h2>
            <div className="address-info">
              <p className="address-name">{order.address.recipientName}</p>
              <p className="address-phone">{order.address.phoneNumber}</p>
              <p className="address-street">{order.address.street}</p>
              <p className="address-location">
                {order.address.ward}, {order.address.district}, {order.address.province}
              </p>
              {order.address.notes && <p className="address-notes">Notes: {order.address.notes}</p>}
            </div>
          </div>
        )}

        {/* Payment Info Card */}
        <div className="order-info-card">
          <h2>
            <CreditCard size={20} />
            Payment Information
          </h2>
          <div className="payment-info">
            <div className="info-item">
              <span className="info-label">Payment Method</span>
              <span className="info-value">{order.paymentMethod || 'Cash on Delivery'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Payment Status</span>
              <span className={`info-value ${order.isPaid ? 'text-success' : 'text-warning'}`}>
                {order.isPaid ? 'Paid' : 'Pending'}
              </span>
            </div>
            {order.isPaid && order.paidAt && (
              <div className="info-item">
                <span className="info-label">Paid At</span>
                <span className="info-value">{format(new Date(order.paidAt), 'PPp')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items Card */}
        <div className="order-info-card">
          <h2>
            <Package size={20} />
            Order Items
          </h2>
          <div className="order-items-list">
            {order.items?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <img
                    src={item.product?.images?.[0] || '/placeholder-product.png'}
                    alt={item.product?.name || 'Product'}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h3>{item.product?.name || 'Product'}</h3>
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="item-pricing">
                  <p className="item-unit-price">{formatPrice(item.unitPrice)}</p>
                  <p className="item-subtotal">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            {order.discountCode && (
              <div className="summary-row discount">
                <span>Discount ({order.discountCode.code})</span>
                <span>-{formatPrice(order.discountCode.discountAmount || 0)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <div className="order-actions">
            <Button variant="destructive" onClick={handleCancelOrder}>
              Cancel Order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
