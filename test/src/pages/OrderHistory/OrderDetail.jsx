import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, TrendingUp, CloudRain, Sun, Cloud, Wind, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';
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
          <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="order-detail-content">
        {/* Status History Timeline */}
        {order.history && order.history.length > 0 && (
          <div className="detail-section">
            <h2><Clock size={20} /> Order Timeline</h2>
            <div className="status-timeline">
              {order.history.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-status">
                      <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </div>
                    <p className="timeline-date">{formatDate(item.timestamp)}</p>
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
        {order.payment && (
          <div className="detail-section">
            <h2><CreditCard size={20} /> Payment Information</h2>
            <div className="payment-info">
              <div className="payment-row">
                <span>Payment Method:</span>
                <span className="capitalize">{order.payment.method || order.paymentMethod}</span>
              </div>
              <div className="payment-row">
                <span>Payment Status:</span>
                <Badge variant={order.payment.status === 'paid' ? 'success' : 'secondary'}>
                  {order.payment.status || 'Pending'}
                </Badge>
              </div>
              {order.payment.transactionId && (
                <div className="payment-row">
                  <span>Transaction ID:</span>
                  <span className="transaction-id">{order.payment.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        )}

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
