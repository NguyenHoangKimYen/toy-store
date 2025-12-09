import React from 'react';
import { Truck, Zap, Clock, CloudRain, Package } from 'lucide-react';
import Badge from '@/components/ui/badge';
import { formatPrice } from '@/utils/formatPrice';
import './DeliveryTypeSelector.css';

const DELIVERY_ICONS = {
  economy: Package,
  standard: Truck,
  express: Zap,
  expedited: CloudRain,
};

const DeliveryTypeSelector = ({
  deliveryTypes = [],
  selectedType,
  onSelect,
  shippingFees = {},
  loading = false,
  orderValue = 0,
}) => {
  if (!deliveryTypes.length) {
    return null;
  }

  const freeShippingThreshold = 500000;
  const qualifiesForFreeShipping = orderValue >= freeShippingThreshold;

  return (
    <div className="delivery-type-selector">
      <h3 className="delivery-section-title">
        <Truck size={20} />
        Delivery Method
      </h3>
      
      {qualifiesForFreeShipping && (
        <div className="free-shipping-notice">
          🎉 Your order qualifies for free shipping on most delivery methods!
        </div>
      )}

      <div className="delivery-options">
        {deliveryTypes.map((type) => {
          const Icon = DELIVERY_ICONS[type.id] || Truck;
          const isSelected = selectedType === type.id;
          const fee = shippingFees[type.id];
          const isAvailable = type.available !== false;
          
          // Check if this type gets full free shipping or partial discount
          const isExpedited = type.id === 'expedited';
          const hasFreeShipping = qualifiesForFreeShipping && !isExpedited;
          const hasPartialDiscount = qualifiesForFreeShipping && isExpedited;
          
          return (
            <label
              key={type.id}
              className={`delivery-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
            >
              <input
                type="radio"
                name="deliveryType"
                value={type.id}
                checked={isSelected}
                onChange={() => isAvailable && onSelect(type.id)}
                disabled={!isAvailable || loading}
              />
              
              <div className="delivery-option-content">
                <div className="delivery-option-header">
                  <div className="delivery-icon-wrapper">
                    <Icon size={20} />
                  </div>
                  <div className="delivery-info">
                    <span className="delivery-name">
                      {type.name}
                      {isExpedited && <Badge variant="secondary" className="weather-badge">Weather fees apply</Badge>}
                    </span>
                    <span className="delivery-description">{type.description}</span>
                  </div>
                </div>
                
                <div className="delivery-meta">
                  <div className="delivery-time">
                    <Clock size={14} />
                    <span>
                      {type.estimatedDays?.min === 0 
                        ? `Same day - ${type.estimatedDays?.max} day${type.estimatedDays?.max > 1 ? 's' : ''}`
                        : `${type.estimatedDays?.min}-${type.estimatedDays?.max} days`
                      }
                    </span>
                  </div>
                  
                  <div className="delivery-price">
                    {loading ? (
                      <span className="price-loading">Calculating...</span>
                    ) : fee !== undefined ? (
                      <>
                        {hasFreeShipping ? (
                          <span className="price-free">FREE</span>
                        ) : hasPartialDiscount ? (
                          <span className="price-discounted">
                            {formatPrice(fee)}
                            <span className="discount-note">(30% off)</span>
                          </span>
                        ) : fee === 0 ? (
                          <span className="price-free">FREE</span>
                        ) : (
                          <span className="price-amount">{formatPrice(fee)}</span>
                        )}
                      </>
                    ) : (
                      <span className="price-tbd">Select address first</span>
                    )}
                  </div>
                </div>

                {!isAvailable && (
                  <div className="delivery-unavailable">
                    {type.unavailableReason || 'Not available in your area'}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryTypeSelector;
