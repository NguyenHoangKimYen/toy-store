import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Package, Clock, CheckCircle, XCircle, Truck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { formatPrice } from '@/utils/formatPrice';
import { ROUTES } from '@/config/routes';
import { useOrders } from '@/hooks';
import { toast } from 'sonner';
import './OrderCard.css';

// Helper to parse MongoDB Decimal128
const parseDecimal = (value) => {
  if (!value) return 0;
  if (typeof value === 'object' && value.$numberDecimal) {
    return parseFloat(value.$numberDecimal);
  }
  return parseFloat(value) || 0;
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();
  const { cancelCurrentOrder } = useOrders();

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
        return <Package size={16} />;
      case 'shipping':
        return <Truck size={16} />;
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'cancelled':
      case 'returned':
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'shipping':
        return 'default';
      case 'delivered':
        return 'success';
      case 'cancelled':
      case 'returned':
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

  const handleViewDetails = () => {
    navigate(`${ROUTES.ORDER_HISTORY}/${order._id}`);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelling(true);
      await cancelCurrentOrder(order._id);
      toast.success('Order cancelled successfully');
      // Optionally trigger a refresh or update parent component
    } catch (err) {
      console.error('Failed to cancel order:', err);
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleBuyAgain = () => {
    // Navigate to products or add items back to cart
    toast.info('Buy Again feature coming soon!');
  };

  const handleWriteReview = (productId) => {
    // Navigate to product page with reviews section anchor
    navigate(`${ROUTES.PRODUCT_DETAIL.replace(':id', productId)}#reviews`);
  };

  const totalAmount = parseDecimal(order.totalAmount);
  const shippingFee = parseDecimal(order.shippingFee);
  const discountAmount = parseDecimal(order.discountAmount);
  const voucherDiscount = parseDecimal(order.voucherDiscount);
  const pointsUsed = order.pointsUsed || 0;
  
  const subtotal = totalAmount - shippingFee + discountAmount + voucherDiscount + pointsUsed;

  return (
    <div className="order-card">
      <div className="order-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="order-header-left">
          <div className="order-number">
            <span className="order-label">Order #</span>
            <span className="order-id">{order._id.slice(-8).toUpperCase()}</span>
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
          <span className="order-total">{formatPrice(totalAmount)}</span>
          <Button variant="ghost" size="sm" className="expand-btn">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="order-card-body">
          {/* Order Items */}
          <div className="order-items">
            <h4 className="order-items-title">Items ({order.items?.length || 0})</h4>
            {order.items?.map((item, index) => {
              const itemSubtotal = parseDecimal(item.subtotal);
              const isDelivered = order.status.toLowerCase() === 'delivered';
              const productId = item.productId?._id || item.productId;
              
              return (
                <div key={index} className="order-item">
                  <img
                    src={item.productId?.images?.[0] || '/placeholder.png'}
                    alt={item.productId?.name || 'Product'}
                    className="order-item-image"
                  />
                  <div className="order-item-details">
                    <p className="order-item-name">{item.productId?.name || 'Unknown Product'}</p>
                    {item.variantId && (
                      <p className="order-item-variant">
                        {item.variantId.color || ''} {item.variantId.size || ''}
                      </p>
                    )}
                    <p className="order-item-quantity">Qty: {item.quantity}</p>
                    {isDelivered && productId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWriteReview(productId);
                        }}
                      >
                        <Star size={14} className="mr-1" />
                        Write Review
                      </Button>
                    )}
                  </div>
                  <p className="order-item-price">{formatPrice(itemSubtotal)}</p>
                </div>
              );
            })}
          </div>

          {/* Shipping Address */}
          {order.addressId && (
            <div className="order-shipping">
              <h4 className="order-section-title">Shipping Address</h4>
              <div className="shipping-address">
                <p className="address-name">{order.addressId.fullNameOfReceiver || 'N/A'}</p>
                <p className="address-line">{order.addressId.addressLine || 'N/A'}</p>
                <p className="address-phone">{order.addressId.phone || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="order-summary">
            <h4 className="order-section-title">Order Summary</h4>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Discount:</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            {voucherDiscount > 0 && (
              <div className="summary-row discount">
                <span>Voucher:</span>
                <span>-{formatPrice(voucherDiscount)}</span>
              </div>
            )}
            {pointsUsed > 0 && (
              <div className="summary-row discount">
                <span>Points Used:</span>
                <span>-{formatPrice(pointsUsed)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="order-actions">
            <Button variant="outline" size="sm" onClick={handleViewDetails}>
              View Details
            </Button>
            {order.status.toLowerCase() === 'delivered' && (
              <Button variant="outline" size="sm" onClick={handleBuyAgain}>
                Buy Again
              </Button>
            )}
            {(order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'confirmed') && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
