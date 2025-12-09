import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/badge';
import { formatPrice } from '@/utils/formatPrice';
import { ROUTES } from '@/config/routes';
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
  const navigate = useNavigate();

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

  const handleClick = () => {
    navigate(`${ROUTES.ORDER_HISTORY}/${order._id}`);
  };

  const totalAmount = parseDecimal(order.totalAmount);
  const itemCount = order.items?.length || 0;

  // Get first item image for preview
  const previewImage = order.items?.[0]?.productId?.imageUrls?.[0] || 
                       order.items?.[0]?.variantId?.imageUrls?.[0] || 
                       '/placeholder-product.png';

  return (
    <div className="order-card order-card-clickable" onClick={handleClick}>
      <div className="order-card-content">
        <div className="order-preview-image">
          <img src={previewImage} alt="Order preview" loading="lazy" />
          {itemCount > 1 && (
            <span className="item-count-badge">+{itemCount - 1}</span>
          )}
        </div>
        
        <div className="order-info">
          <div className="order-header-info">
            <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
            <span className="order-date">{formatDate(order.createdAt)}</span>
          </div>
          
          <div className="order-meta">
            <span className="item-summary">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            <Badge variant={getStatusVariant(order.status)} className="order-status-badge">
              {getStatusIcon(order.status)}
              {order.status}
            </Badge>
          </div>
        </div>
        
        <div className="order-end">
          <span className="order-total">{formatPrice(totalAmount)}</span>
          <ChevronRight size={20} className="chevron-icon" />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
