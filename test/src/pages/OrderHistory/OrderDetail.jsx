import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, TrendingUp, CloudRain, Sun, Cloud, Wind, Star, Calendar, Hash, Truck, CheckCircle, XCircle, AlertCircle, Wallet, Receipt, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { formatPrice } from '@/utils/formatPrice';
import { ROUTES } from '@/config/routes';
import { useOrderDetail } from './hooks/useOrderDetail';
import './OrderDetail.css';

// Helper to parse MongoDB Decimal128
const parseDecimal = (value) => {
  if (!value) return 0;
  if (typeof value === 'object' && value.$numberDecimal) {
    return parseFloat(value.$numberDecimal);
  }
  return parseFloat(value) || 0;
};

// Format date with time
const formatDateTime = (date, showTime = true) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const dateOptions = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  if (showTime) {
    return `${d.toLocaleDateString('en-US', dateOptions)} at ${d.toLocaleTimeString('en-US', timeOptions)}`;
  }
  return d.toLocaleDateString('en-US', dateOptions);
};

// Format relative time (e.g., "2 hours ago")
const formatRelativeTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return null; // Return null for older dates to show full date instead
};

// Get payment method display name and icon
const getPaymentMethodInfo = (method) => {
  const methods = {
    'zalopay': { name: 'ZaloPay', icon: '💳', color: '#0068ff' },
    'momo': { name: 'MoMo', icon: '📱', color: '#d82d8b' },
    'vietqr': { name: 'VietQR Bank Transfer', icon: '🏦', color: '#1a73e8' },
    'cashondelivery': { name: 'Cash on Delivery (COD)', icon: '💵', color: '#2e7d32' },
    'cod': { name: 'Cash on Delivery (COD)', icon: '💵', color: '#2e7d32' },
    'cash': { name: 'Cash on Delivery', icon: '💵', color: '#2e7d32' },
  };
  const key = (method || '').toLowerCase();
  return methods[key] || { name: method || 'Unknown', icon: '💳', color: '#666' };
};

// Get payment status info
const getPaymentStatusInfo = (status) => {
  const statuses = {
    'paid': { label: 'Paid', variant: 'success', icon: CheckCircle },
    'pending': { label: 'Pending', variant: 'secondary', icon: AlertCircle },
    'failed': { label: 'Failed', variant: 'destructive', icon: XCircle },
    'refunded': { label: 'Refunded', variant: 'default', icon: Wallet },
  };
  const key = (status || '').toLowerCase();
  return statuses[key] || { label: status || 'Unknown', variant: 'secondary', icon: AlertCircle };
};

const getWeatherIcon = (condition) => {
  if (!condition || typeof condition !== 'string') return <Cloud size={20} />;
  const lower = condition.toLowerCase();
  if (lower.includes('rain') || lower.includes('storm')) return <CloudRain size={20} />;
  if (lower.includes('clear') || lower.includes('sunny')) return <Sun size={20} />;
  if (lower.includes('wind')) return <Wind size={20} />;
  return <Cloud size={20} />;
};

const getStatusVariant = (status) => {
  if (!status || typeof status !== 'string') return 'default';
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

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { order, loading, error } = useOrderDetail(orderId);

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="loading-spinner">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-container">
        <div className="error-message">
          <p>{error}</p>
          <Button onClick={() => navigate(ROUTES.ORDER_HISTORY)}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="error-message">
          <p>Order not found</p>
          <Button onClick={() => navigate(ROUTES.ORDER_HISTORY)}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const totalAmount = parseDecimal(order.totalAmount);
  const shippingFee = parseDecimal(order.shippingFee);
  const discountAmount = parseDecimal(order.discountAmount);
  const voucherDiscount = parseDecimal(order.voucherDiscount);
  const pointsUsed = parseDecimal(order.pointsUsed);
  
  const subtotal = totalAmount - shippingFee + discountAmount + voucherDiscount + pointsUsed;

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
          <ArrowLeft size={20} />
          Back to Orders
        </Button>
        <div className="header-info">
          <h1>Order Details</h1>
          <div className="order-meta">
            <span className="order-id">Order #{order._id}</span>
            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
          </div>
          <p className="order-date">
            <Calendar size={14} />
            {formatDateTime(order.createdAt)}
            {formatRelativeTime(order.createdAt) && (
              <span className="relative-time">({formatRelativeTime(order.createdAt)})</span>
            )}
          </p>
        </div>
      </div>

      <div className="order-detail-content">
        {/* Quick Info Cards */}
        <div className="quick-info-grid">
          <div className="quick-info-card">
            <div className="quick-info-icon payment">
              <CreditCard size={20} />
            </div>
            <div className="quick-info-content">
              <span className="quick-info-label">Payment Method</span>
              <span className="quick-info-value">
                {getPaymentMethodInfo(order.paymentMethod || order.payment?.method).icon}{' '}
                {getPaymentMethodInfo(order.paymentMethod || order.payment?.method).name}
              </span>
            </div>
          </div>
          
          <div className="quick-info-card">
            <div className={`quick-info-icon ${order.paymentStatus === 'paid' || order.payment?.status === 'paid' ? 'success' : 'pending'}`}>
              {(() => {
                const StatusIcon = getPaymentStatusInfo(order.paymentStatus || order.payment?.status).icon;
                return <StatusIcon size={20} />;
              })()}
            </div>
            <div className="quick-info-content">
              <span className="quick-info-label">Payment Status</span>
              <Badge variant={getPaymentStatusInfo(order.paymentStatus || order.payment?.status).variant}>
                {getPaymentStatusInfo(order.paymentStatus || order.payment?.status).label}
              </Badge>
            </div>
          </div>
          
          <div className="quick-info-card">
            <div className="quick-info-icon shipping">
              <Truck size={20} />
            </div>
            <div className="quick-info-content">
              <span className="quick-info-label">Delivery Status</span>
              <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
            </div>
          </div>
          
          <div className="quick-info-card">
            <div className="quick-info-icon items">
              <Package size={20} />
            </div>
            <div className="quick-info-content">
              <span className="quick-info-label">Total Items</span>
              <span className="quick-info-value">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Order ID & Transaction Info */}
        <div className="detail-section compact">
          <h2><Receipt size={20} /> Order Information</h2>
          <div className="order-info-grid">
            <div className="info-item">
              <span className="info-label"><Hash size={14} /> Order ID</span>
              <span className="info-value copyable" onClick={() => navigator.clipboard.writeText(order._id)}>
                {order._id}
                <Copy size={12} />
              </span>
            </div>
            <div className="info-item">
              <span className="info-label"><Calendar size={14} /> Order Date</span>
              <span className="info-value">{formatDateTime(order.createdAt)}</span>
            </div>
            {order.payment?.transactionId && (
              <div className="info-item">
                <span className="info-label"><Hash size={14} /> Transaction ID</span>
                <span className="info-value copyable" onClick={() => navigator.clipboard.writeText(order.payment.transactionId)}>
                  {order.payment.transactionId}
                  <Copy size={12} />
                </span>
              </div>
            )}
            {order.zaloAppTransId && (
              <div className="info-item">
                <span className="info-label"><Hash size={14} /> ZaloPay Trans ID</span>
                <span className="info-value copyable" onClick={() => navigator.clipboard.writeText(order.zaloAppTransId)}>
                  {order.zaloAppTransId}
                  <Copy size={12} />
                </span>
              </div>
            )}
            {order.payment?.paidAt && (
              <div className="info-item">
                <span className="info-label"><CheckCircle size={14} /> Paid At</span>
                <span className="info-value">{formatDateTime(order.payment.paidAt)}</span>
              </div>
            )}
            {order.updatedAt && order.updatedAt !== order.createdAt && (
              <div className="info-item">
                <span className="info-label"><Clock size={14} /> Last Updated</span>
                <span className="info-value">{formatDateTime(order.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status History Timeline */}
        {order.history && order.history.length > 0 && (
          <div className="detail-section">
            <h2><Clock size={20} /> Order Timeline</h2>
            <div className="status-timeline">
              {order.history.map((item, index) => (
                <div key={index} className={`timeline-item ${index === 0 ? 'latest' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-status">
                      <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </div>
                    <p className="timeline-date">
                      {formatDateTime(item.timestamp)}
                      {formatRelativeTime(item.timestamp) && (
                        <span className="relative-time">({formatRelativeTime(item.timestamp)})</span>
                      )}
                    </p>
                    {item.note && <p className="timeline-note">{item.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="detail-section">
          <h2><Package size={20} /> Items ({order.items?.length || 0})</h2>
          <div className="items-list">
            {order.items?.map((item, index) => {
              const productId = item.productId?._id || item.productId;
              const productSlug = item.productId?.slug;
              const productLink = productSlug ? `/products/${productSlug}` : `/products/${productId}`;
              const isDelivered = order.status === 'delivered';
              
              // Get image: prefer variant image, then product image, then placeholder
              const imageUrl = item.variantId?.imageUrls?.[0] || item.productId?.imageUrls?.[0] || '/placeholder-product.png';
              
              // Get variant attributes for display
              const variantAttrs = item.variantId?.attributes;
              const variantDisplay = Array.isArray(variantAttrs) 
                ? variantAttrs.map(attr => `${attr.name}: ${attr.value}`).join(' • ')
                : '';
              
              return (
                <div key={index} className="item-card">
                  <Link to={productLink} className="item-product-link">
                    <img 
                      src={imageUrl} 
                      alt={item.productId?.name || 'Product'}
                      className="item-image"
                    />
                    <div className="item-info">
                      <h3>{item.productId?.name || 'Unknown Product'}</h3>
                      {variantDisplay && (
                        <p className="item-variant">{variantDisplay}</p>
                      )}
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                    </div>
                  </Link>
                  <div className="item-actions">
                    <div className="item-price">
                      <p className="unit-price">{formatPrice(parseDecimal(item.unitPrice))}</p>
                      <p className="subtotal-price">{formatPrice(parseDecimal(item.subtotal))}</p>
                    </div>
                    {isDelivered && productId && (
                      <Link 
                        to={`${productLink}#reviews`}
                        className="write-review-btn"
                      >
                        <Star size={14} />
                        Write Review
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping Information */}
        <div className="detail-section">
          <h2><MapPin size={20} /> Shipping Information</h2>
          <div className="shipping-info">
            <div className="address-details">
              <p className="receiver-name">{order.addressId?.fullNameOfReceiver}</p>
              <p className="receiver-phone">{order.addressId?.phone}</p>
              <p className="address-line">{order.addressId?.addressLine}</p>
              <p className="address-city">{order.addressId?.city} {order.addressId?.postalCode}</p>
            </div>
            
            {order.shipping && (
              <div className="shipping-breakdown">
                <h3>Shipping Details</h3>
                <div className="shipping-row">
                  <span>Base Fee:</span>
                  <span>{formatPrice(order.shipping.baseFee || 0)}</span>
                </div>
                {order.shipping.distanceFee > 0 && (
                  <div className="shipping-row">
                    <span>Distance Fee:</span>
                    <span>{formatPrice(order.shipping.distanceFee)}</span>
                  </div>
                )}
                {order.shipping.regionFee > 0 && (
                  <div className="shipping-row">
                    <span>Region Fee:</span>
                    <span>{formatPrice(order.shipping.regionFee)}</span>
                  </div>
                )}
                {order.shipping.weatherFee > 0 && (
                  <div className="shipping-row">
                    <span>Weather Fee:</span>
                    <span>{formatPrice(order.shipping.weatherFee)}</span>
                  </div>
                )}
                {order.shipping.weather && (
                  <div className="weather-info">
                    {getWeatherIcon(order.shipping.weather)}
                    <span>Weather: {typeof order.shipping.weather === 'string' ? order.shipping.weather : 'N/A'}</span>
                  </div>
                )}
                <div className="shipping-row total">
                  <span>Total Shipping:</span>
                  <span>{formatPrice(order.shipping.fee)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="detail-section">
          <h2><CreditCard size={20} /> Payment Details</h2>
          <div className="payment-info enhanced">
            <div className="payment-method-display">
              <span 
                className="payment-method-icon" 
                style={{ backgroundColor: getPaymentMethodInfo(order.paymentMethod || order.payment?.method).color + '15' }}
              >
                {getPaymentMethodInfo(order.paymentMethod || order.payment?.method).icon}
              </span>
              <div className="payment-method-text">
                <span className="method-name">{getPaymentMethodInfo(order.paymentMethod || order.payment?.method).name}</span>
                <span className="method-status">
                  <Badge variant={getPaymentStatusInfo(order.paymentStatus || order.payment?.status).variant}>
                    {getPaymentStatusInfo(order.paymentStatus || order.payment?.status).label}
                  </Badge>
                </span>
              </div>
            </div>
            
            <div className="payment-details-grid">
              {order.payment?.transactionId && (
                <div className="payment-detail-item">
                  <span className="detail-label">Transaction ID</span>
                  <span className="detail-value mono">{order.payment.transactionId}</span>
                </div>
              )}
              {order.zaloAppTransId && (
                <div className="payment-detail-item">
                  <span className="detail-label">ZaloPay Reference</span>
                  <span className="detail-value mono">{order.zaloAppTransId}</span>
                </div>
              )}
              {order.payment?.paidAt && (
                <div className="payment-detail-item">
                  <span className="detail-label">Payment Time</span>
                  <span className="detail-value">{formatDateTime(order.payment.paidAt)}</span>
                </div>
              )}
              <div className="payment-detail-item">
                <span className="detail-label">Amount Paid</span>
                <span className="detail-value amount">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="detail-section">
          <h2><TrendingUp size={20} /> Order Summary</h2>
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Discount Code:</span>
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
                <span>Loyalty Points:</span>
                <span>-{formatPrice(pointsUsed)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping Fee:</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
