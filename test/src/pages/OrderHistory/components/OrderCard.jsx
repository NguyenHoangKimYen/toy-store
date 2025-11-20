import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { formatPrice } from '@/utils/formatPrice';
import './OrderCard.css';

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock size={16} />;
      case 'processing':
        return <Package size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="order-card">
      <div className="order-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="order-header-left">
          <div className="order-number">
            <span className="order-label">Order #</span>
            <span className="order-id">{order.orderNumber || order._id.slice(-8)}</span>
          </div>
          <div className="order-date">
            <span className="date-label">Placed on</span>
            <span className="date-value">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="order-header-right">
          <Badge variant={getStatusVariant(order.status)} className="order-status-badge">
            {getStatusIcon(order.status)}
            {order.status}
          </Badge>
          <span className="order-total">{formatPrice(order.totalAmount)}</span>
          <Button variant="ghost" size="sm" className="expand-btn">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="order-card-body">
          {/* Order Items */}
          <div className="order-items">
            <h4 className="order-items-title">Items ({order.items.length})</h4>
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <img
                  src={item.product?.imageUrls?.[0] || '/placeholder.png'}
                  alt={item.product?.name || 'Product'}
                  className="order-item-image"
                />
                <div className="order-item-details">
                  <p className="order-item-name">{item.product?.name || 'Unknown Product'}</p>
                  <p className="order-item-quantity">Qty: {item.quantity}</p>
                </div>
                <p className="order-item-price">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          <div className="order-shipping">
            <h4 className="order-section-title">Shipping Address</h4>
            <div className="shipping-address">
              <p className="address-name">{order.shippingAddress?.fullName}</p>
              <p className="address-line">{order.shippingAddress?.addressLine}</p>
              <p className="address-city">
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
              </p>
              <p className="address-phone">{order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h4 className="order-section-title">Order Summary</h4>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{formatPrice(order.shippingFee || 0)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>{formatPrice(order.tax || 0)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="order-actions">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            {order.status.toLowerCase() === 'delivered' && (
              <Button variant="outline" size="sm">
                Buy Again
              </Button>
            )}
            {(order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'processing') && (
              <Button variant="destructive" size="sm">
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
