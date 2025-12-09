import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronLeft, Package, MapPin, CreditCard, Clock, History, Truck, Cloud, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, NotFoundPage } from '@/components/common';
import { useOrders } from '@/hooks';
import { formatPrice } from '@/utils';
import { ROUTES } from '@/config/routes';
import './OrderDetail.css';

const statusConfig = {
  pending: { label: 'Pending', color: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'info', icon: Package },
  shipping: { label: 'Shipping', color: 'primary', icon: Truck },
  delivered: { label: 'Delivered', color: 'success', icon: Package },
  cancelled: { label: 'Cancelled', color: 'danger', icon: Package },
  returned: { label: 'Returned', color: 'danger', icon: Package },
};

// Helper to parse MongoDB Decimal128
const parseDecimal = (value) => {
  if (!value) return 0;
  if (typeof value === 'object' && value.$numberDecimal) {
    return parseFloat(value.$numberDecimal);
  }
  return parseFloat(value) || 0;
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
      <NotFoundPage
        icon={ShoppingBag}
        title="Order Not Found"
        message="This order doesn't exist or you don't have permission to view it."
        homeRoute={ROUTES.ORDER_HISTORY}
        homeLabel="View My Orders"
      />
    );
  }

  const order = currentOrder;
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  // Parse decimal amounts
  const totalAmount = parseDecimal(order.totalAmount);
  const shippingFee = parseDecimal(order.shippingFee);
  const discountAmount = parseDecimal(order.discountAmount);
  const voucherDiscount = parseDecimal(order.voucherDiscount);
  const pointsUsed = order.pointsUsed || 0;
  const pointsEarned = order.pointsEarned || 0;

  // Calculate subtotal (goods total before shipping)
  const subtotal = totalAmount - shippingFee;

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
          <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
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
              <span className="info-label">Delivery Type</span>
              <span className="info-value">{order.deliveryType === 'express' ? 'Express' : 'Standard'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Amount</span>
              <span className="info-value">{formatPrice(totalAmount)}</span>
            </div>
            {pointsUsed > 0 && (
              <div className="info-item">
                <span className="info-label">Points Used</span>
                <span className="info-value">{pointsUsed} pts (-{formatPrice(pointsUsed)})</span>
              </div>
            )}
            {pointsEarned > 0 && (
              <div className="info-item">
                <span className="info-label">Points Earned</span>
                <span className="info-value">+{pointsEarned} pts</span>
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
              <p className="address-name">{order.address.fullNameOfReceiver || 'N/A'}</p>
              <p className="address-phone">{order.address.phone || 'N/A'}</p>
              <p className="address-street">{order.address.addressLine || 'N/A'}</p>
              {order.address.lat && order.address.lng && (
                <p className="address-location">
                  Coordinates: {order.address.lat}, {order.address.lng}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Shipping Info Card */}
        {order.shipping && (
          <div className="order-info-card">
            <h2>
              <Truck size={20} />
              Shipping Information
            </h2>
            <div className="shipping-info">
              <div className="info-item">
                <span className="info-label">Shipping Fee</span>
                <span className="info-value">{formatPrice(shippingFee)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Delivery Type</span>
                <span className="info-value">
                  {order.deliveryType === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                </span>
              </div>
              {order.shipping.estimatedTime && (
                <div className="info-item">
                  <span className="info-label">Estimated Delivery</span>
                  <span className="info-value">{order.shipping.estimatedTime}</span>
                </div>
              )}
              {order.shipping.distance && (
                <div className="info-item">
                  <span className="info-label">Distance</span>
                  <span className="info-value">{order.shipping.distance.toFixed(2)} km</span>
                </div>
              )}
              {order.shipping.weather && (
                <div className="weather-info">
                  <Cloud size={16} />
                  <span>Weather: {order.shipping.weather.main || 'Unknown'}</span>
                  {order.shipping.weather.description && (
                    <span className="weather-desc">({order.shipping.weather.description})</span>
                  )}
                </div>
              )}
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
            {order.payment && (
              <>
                <div className="info-item">
                  <span className="info-label">Payment Status</span>
                  <span className={`info-value ${order.payment.status === 'completed' ? 'text-success' : 'text-warning'}`}>
                    {order.payment.status || 'Pending'}
                  </span>
                </div>
                {order.payment.transactionId && (
                  <div className="info-item">
                    <span className="info-label">Transaction ID</span>
                    <span className="info-value">{order.payment.transactionId}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Status History Card */}
        {order.history && order.history.length > 0 && (
          <div className="order-info-card status-history-card">
            <h2>
              <History size={20} />
              Status History
            </h2>
            <div className="status-history-table-wrapper">
              <table className="status-history-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {order.history.map((entry, index) => {
                    const historyStatus = statusConfig[entry.status] || statusConfig.pending;
                    const HistoryIcon = historyStatus.icon;
                    return (
                      <tr key={entry._id || index}>
                        <td>
                          <div className={`status-badge status-${historyStatus.color}`}>
                            <HistoryIcon size={14} />
                            <span>{historyStatus.label}</span>
                          </div>
                        </td>
                        <td>{format(new Date(entry.updatedAt || entry.createdAt), 'PPp')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Items Card */}
        <div className="order-info-card">
          <h2>
            <Package size={20} />
            Order Items
          </h2>
          <div className="order-items-list">
            {order.items?.map((item, index) => {
              const itemUnitPrice = parseDecimal(item.unitPrice);
              const itemSubtotal = parseDecimal(item.subtotal);
              // Get product image - check multiple possible locations
              const productImage = item.productId?.imageUrls?.[0] || 
                                   item.variantId?.imageUrls?.[0] || 
                                   item.productId?.images?.[0] || 
                                   '/placeholder-product.png';
              
              return (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <img
                      src={productImage}
                      alt={item.productId?.name || 'Product'}
                      className="item-image"
                      loading="lazy"
                    />
                    <div className="item-details">
                      <h3>{item.productId?.name || 'Product'}</h3>
                      {item.variantId && (
                        <p className="item-variant">
                          Variant: {item.variantId.color || ''} {item.variantId.size || ''}
                        </p>
                      )}
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="item-pricing">
                    <p className="item-unit-price">{formatPrice(itemUnitPrice)} each</p>
                    <p className="item-subtotal">{formatPrice(itemSubtotal)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal (Goods)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Discount Code</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            {voucherDiscount > 0 && (
              <div className="summary-row discount">
                <span>Voucher Discount</span>
                <span>-{formatPrice(voucherDiscount)}</span>
              </div>
            )}
            {pointsUsed > 0 && (
              <div className="summary-row discount">
                <span>Points Used ({pointsUsed} pts)</span>
                <span>-{formatPrice(pointsUsed)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
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
