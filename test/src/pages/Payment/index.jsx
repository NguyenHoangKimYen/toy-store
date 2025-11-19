import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { useOrders } from '@/hooks';
import { getVietQR, customerConfirmVietQR, createMomoPayment, createZaloPayOrder } from '@/services';
import { formatPrice } from '@/utils';
import { ROUTES } from '@/config/routes';
import './Payment.css';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrder, fetchOrderById } = useOrders();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Check for payment callback (MoMo, ZaloPay return)
  const resultCode = searchParams.get('resultCode');
  const paymentStatus = searchParams.get('status');

  useEffect(() => {
    if (orderId) {
      loadPaymentInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadPaymentInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch order details
      const order = await fetchOrderById(orderId);

      if (!order) {
        setError('Order not found');
        return;
      }

      // Handle payment based on method
      if (order.paymentMethod === 'vietqr' && !order.isPaid) {
        // Get QR code for VietQR
        const qrData = await getVietQR(orderId);
        setQrCode(qrData);
      } else if (order.paymentMethod === 'momo' && !order.isPaid) {
        // Redirect to MoMo
        const momoData = await createMomoPayment(orderId);
        if (momoData.payUrl) {
          window.location.href = momoData.payUrl;
        }
      } else if (order.paymentMethod === 'zalopay' && !order.isPaid) {
        // Redirect to ZaloPay
        const zaloPayData = await createZaloPayOrder(orderId);
        if (zaloPayData.order_url) {
          window.location.href = zaloPayData.order_url;
        }
      }
    } catch (err) {
      console.error('Error loading payment info:', err);
      setError(err.message || 'Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setConfirming(true);
      await customerConfirmVietQR(orderId);
      
      // Refresh order to get updated status
      await fetchOrderById(orderId);
      
      alert('Payment confirmation sent! Admin will verify and confirm your payment.');
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError(err.message || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-error">
        <ErrorMessage message={error} />
        <Button onClick={() => navigate(`/orders/${orderId}`)}>View Order</Button>
      </div>
    );
  }

  // Show success/failure based on payment callback
  if (resultCode || paymentStatus) {
    const isSuccess = resultCode === '0' || paymentStatus === 'success';
    
    return (
      <div className="payment-result">
        <div className={`payment-result-card ${isSuccess ? 'success' : 'failed'}`}>
          {isSuccess ? (
            <>
              <CheckCircle size={64} className="result-icon success" />
              <h1>Payment Successful!</h1>
              <p>Your payment has been processed successfully.</p>
            </>
          ) : (
            <>
              <XCircle size={64} className="result-icon failed" />
              <h1>Payment Failed</h1>
              <p>We couldn't process your payment. Please try again.</p>
            </>
          )}
          
          <div className="result-actions">
            <Button onClick={() => navigate(`/orders/${orderId}`)}>View Order</Button>
            {!isSuccess && (
              <Button variant="outline" onClick={() => loadPaymentInfo()}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="payment-error">
        <ErrorMessage message="Order not found" />
        <Button onClick={() => navigate(ROUTES.ORDER_HISTORY)}>Back to Orders</Button>
      </div>
    );
  }

  // Already paid
  if (currentOrder.isPaid) {
    return (
      <div className="payment-result">
        <div className="payment-result-card success">
          <CheckCircle size={64} className="result-icon success" />
          <h1>Already Paid</h1>
          <p>This order has already been paid.</p>
          <div className="result-actions">
            <Button onClick={() => navigate(`/orders/${orderId}`)}>View Order</Button>
          </div>
        </div>
      </div>
    );
  }

  // COD orders
  if (currentOrder.paymentMethod === 'cod') {
    return (
      <div className="payment-result">
        <div className="payment-result-card info">
          <Clock size={64} className="result-icon info" />
          <h1>Cash on Delivery</h1>
          <p>You will pay when you receive the order.</p>
          <div className="order-summary">
            <div className="summary-row">
              <span>Total Amount</span>
              <span className="amount">{formatPrice(currentOrder.totalAmount)}</span>
            </div>
          </div>
          <div className="result-actions">
            <Button onClick={() => navigate(`/orders/${orderId}`)}>View Order</Button>
          </div>
        </div>
      </div>
    );
  }

  // VietQR payment
  if (currentOrder.paymentMethod === 'vietqr' && qrCode) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <div className="payment-header">
            <QrCode size={32} />
            <h1>VietQR Payment</h1>
            <p>Scan QR code with your banking app to complete payment</p>
          </div>

          <div className="qr-section">
            {qrCode.qrDataURL ? (
              <img src={qrCode.qrDataURL} alt="VietQR Code" className="qr-code-image" />
            ) : (
              <div className="qr-placeholder">QR code not available</div>
            )}
          </div>

          <div className="payment-details">
            <h3>Payment Details</h3>
            <div className="detail-row">
              <span>Order ID</span>
              <span className="detail-value">#{currentOrder.id}</span>
            </div>
            <div className="detail-row">
              <span>Amount</span>
              <span className="detail-value amount">{formatPrice(currentOrder.totalAmount)}</span>
            </div>
            {qrCode.accountNo && (
              <div className="detail-row">
                <span>Account Number</span>
                <span className="detail-value">{qrCode.accountNo}</span>
              </div>
            )}
            {qrCode.accountName && (
              <div className="detail-row">
                <span>Account Name</span>
                <span className="detail-value">{qrCode.accountName}</span>
              </div>
            )}
          </div>

          <div className="payment-actions">
            <Button
              onClick={handleConfirmPayment}
              disabled={confirming}
              className="confirm-button"
            >
              {confirming ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Confirming...
                </>
              ) : (
                "I've Transferred"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/orders/${orderId}`)}
            >
              View Order
            </Button>
          </div>

          <div className="payment-note">
            <p>⚠️ After transferring, click "I've Transferred" button.</p>
            <p>Admin will verify your payment and confirm your order.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-error">
      <ErrorMessage message="Payment method not supported" />
      <Button onClick={() => navigate(`/orders/${orderId}`)}>View Order</Button>
    </div>
  );
};

export default Payment;
