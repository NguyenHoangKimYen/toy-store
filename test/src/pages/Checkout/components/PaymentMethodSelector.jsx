import React from 'react';
import { Card } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { CreditCard, Wallet, Truck, QrCode } from 'lucide-react';
import './PaymentMethodSelector.css';

const PAYMENT_METHODS = [
  {
    id: 'vietqr',
    name: 'VietQR',
    icon: QrCode,
    description: 'Pay via bank transfer using QR code',
  },
  {
    id: 'momo',
    name: 'MoMo Wallet',
    icon: Wallet,
    description: 'Pay with MoMo e-wallet',
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: Wallet,
    description: 'Pay with ZaloPay e-wallet',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: Truck,
    description: 'Pay when you receive the order',
  },
];

const PaymentMethodSelector = ({ selectedMethod, onChange }) => {
  return (
    <Card className="payment-method-card">
      <h2 className="payment-method-title">Payment Method</h2>

      <RadioGroup value={selectedMethod} onValueChange={onChange} className="payment-methods">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          return (
            <label
              key={method.id}
              className={`payment-method-option ${
                selectedMethod === method.id ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => onChange(e.target.value)}
                className="payment-radio"
              />
              <div className="payment-method-content">
                <div className="payment-method-header">
                  <Icon size={24} className="payment-icon" />
                  <span className="payment-method-name">{method.name}</span>
                </div>
                <p className="payment-method-description">{method.description}</p>
              </div>
            </label>
          );
        })}
      </RadioGroup>
    </Card>
  );
};

export default PaymentMethodSelector;
