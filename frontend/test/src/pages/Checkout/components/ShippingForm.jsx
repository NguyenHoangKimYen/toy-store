import React from 'react';
import { Card } from '@/components/ui/card';
import AddressSelector from './AddressSelector';
import { useAuth } from '@/hooks/useAuth';
import './ShippingForm.css';

const ShippingForm = ({ selectedAddressId, onAddressSelect }) => {
  const { user } = useAuth();

  return (
    <Card className="shipping-form-card">
      <h2 className="shipping-form-title">Shipping Information</h2>

      <div className="shipping-form-content">
        <AddressSelector
          userId={user?._id}
          selectedAddressId={selectedAddressId}
          onSelectAddress={onAddressSelect}
        />
      </div>
    </Card>
  );
};

export default ShippingForm;
