import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import './ShippingForm.css';

const ShippingForm = ({ shippingInfo, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...shippingInfo, [name]: value });
  };

  return (
    <Card className="shipping-form-card">
      <h2 className="shipping-form-title">Shipping Information</h2>

      <div className="shipping-form-grid">
        {/* Full Name */}
        <div className="form-field full-width">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            name="fullName"
            value={shippingInfo.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>

        {/* Email */}
        <div className="form-field full-width">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={shippingInfo.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />
        </div>

        {/* Phone */}
        <div className="form-field full-width">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={shippingInfo.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            required
          />
        </div>

        {/* Address */}
        <div className="form-field full-width">
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            name="address"
            value={shippingInfo.address}
            onChange={handleChange}
            placeholder="123 Main St"
            required
          />
        </div>

        {/* City */}
        <div className="form-field">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            name="city"
            value={shippingInfo.city}
            onChange={handleChange}
            placeholder="New York"
            required
          />
        </div>

        {/* State */}
        <div className="form-field">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            name="state"
            value={shippingInfo.state}
            onChange={handleChange}
            placeholder="NY"
            required
          />
        </div>

        {/* ZIP Code */}
        <div className="form-field">
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            name="zipCode"
            value={shippingInfo.zipCode}
            onChange={handleChange}
            placeholder="10001"
            required
          />
        </div>

        {/* Country */}
        <div className="form-field">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            name="country"
            value={shippingInfo.country}
            onChange={handleChange}
            placeholder="USA"
            required
          />
        </div>

        {/* Notes (Optional) */}
        <div className="form-field full-width">
          <Label htmlFor="notes">Delivery Notes (Optional)</Label>
          <Input
            id="notes"
            name="notes"
            value={shippingInfo.notes}
            onChange={handleChange}
            placeholder="Leave at front door"
          />
        </div>
      </div>
    </Card>
  );
};

export default ShippingForm;
