import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { useOrders } from '@/hooks';
import { getVietQR, customerConfirmVietQR, createMomoPayment, createZaloPayOrder, zaloPayReturn, payByCash } from '@/services';
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
  const [paymentResponse, setPaymentResponse] = useState(null);

  // Check for payment callback (MoMo, ZaloPay return)
  const resultCode = searchParams.get('resultCode'); // MoMo uses resultCode
  const paymentStatus = searchParams.get('status'); // ZaloPay uses status (1 = success, -1 = failed)

  const normalizeAmount = (order, qr) => {
    const raw =
      order?.totalAmount?.$numberDecimal ??
      order?.totalAmount ??
      qr?.amount ??
      null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  };

  useEffect(() => {
    if (orderId) {
      loadPaymentInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Handle ZaloPay return - confirm payment status
  useEffect(() => {
    const confirmZaloPayPayment = async () => {
      const status = searchParams.get('status');
      const apptransid = searchParams.get('apptransid');
      
      if (status === '1' && apptransid) {
        try {
          const response = await zaloPayReturn({ 
            status, 
            apptransid,
            amount: searchParams.get('amount')
          });
          setPaymentResponse(response);
          // Refresh order details after confirming payment
          if (orderId) {
            await fetchOrderById(orderId);
          }
        } catch (err) {
          console.error('Error confirming ZaloPay payment:', err);
        }
      }
    };

    confirmZaloPayPayment();
  }, [searchParams, orderId, fetchOrderById]);

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

      // Get payment method, default to 'cod' if not set
      const orderPaymentMethod = order.paymentMethod || 'cashondelivery';

      // Check if we're returning from a payment gateway
      const isReturningFromPayment = resultCode || paymentStatus || 
        searchParams.get('apptransid') || searchParams.get('orderId');

      // Handle payment based on method
      if (orderPaymentMethod === 'vietqr' && !order.isPaid) {
        // Get QR code for VietQR
        const qrData = await getVietQR(orderId);
        if (qrData.success && qrData.qr) {
          // Normalize QR URL to a single field
          const qrUrl = qrData.qr.qrDataURL || qrData.qr.bill || null;
          setQrCode({
            ...qrData.qr,
            qrUrl,
          });
        }
        setLoading(false);
      } else if (orderPaymentMethod === 'momo' && !order.isPaid && !isReturningFromPayment) {
        // Redirect to MoMo - keep loading true to prevent "not supported" message
        const momoData = await createMomoPayment(orderId);
        if (momoData.success && momoData.momo?.payUrl) {
          window.location.href = momoData.momo.payUrl;
          // Keep loading state true during redirect
          return;
        }
        setLoading(false);
      } else if (orderPaymentMethod === 'zalopay' && !order.isPaid && !isReturningFromPayment) {
        // Redirect to ZaloPay - keep loading true to prevent "not supported" message
        const zaloPayData = await createZaloPayOrder(orderId);
        if (zaloPayData.success && zaloPayData.zaloPay) {
          const url = zaloPayData.zaloPay.order_url || zaloPayData.zaloPay.orderurl;
          if (url) {
            window.location.href = url;
            // Keep loading state true during redirect
            return;
          }
        }
        setLoading(false);
      } else if ((orderPaymentMethod === 'cod' || orderPaymentMethod === 'cashondelivery') && !order.isPaid && !isReturningFromPayment) {
        // Confirm COD payment method with backend
        const response = await payByCash(orderId);
        setPaymentResponse(response);
        // Refresh order to show updated status
        await fetchOrderById(orderId);
        setLoading(false);
      } else {
        // For already paid orders or returning from payment
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading payment info:', err);
      setError(err.message || 'Failed to load payment information');
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setConfirming(true);
      await customerConfirmVietQR(orderId);
      
      // Refresh order to get updated status
      await fetchOrderById(orderId);
      navigate('/');
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

  // Check if returning from payment gateway
  const isReturningFromPayment = resultCode || paymentStatus || 
    searchParams.get('apptransid') || searchParams.get('orderId');

  // Show success/failure based on payment callback
  if (resultCode || paymentStatus) {
    // MoMo: resultCode === '0' means success
    // ZaloPay: status === '1' means success
    const isSuccess = resultCode === '0' || paymentStatus === '1';
    
    // Extract backend message
    const backendMessage = paymentResponse?.message || searchParams.get('message');
    const transactionId = searchParams.get('transId') || searchParams.get('apptransid');
    
    return (
      <div className="payment-result">
        <div className={`payment-result-card ${isSuccess ? 'success' : 'failed'}`}>
          {isSuccess ? (
            <>
              <CheckCircle size={64} className="result-icon success" />
              <h1>Thanh toán thành công!</h1>
              <p>{backendMessage || 'Giao dịch của bạn đã được xử lý thành công.'}</p>
              
              {transactionId && (
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Mã giao dịch</span>
                    <span className="detail-value">{transactionId}</span>
                  </div>
                  {currentOrder && (
                    <>
                      <div className="summary-row">
                        <span>Mã đơn hàng</span>
                        <span className="detail-value">#{currentOrder._id || currentOrder.id || orderId}</span>
                      </div>
                      <div className="summary-row">
                        <span>Số tiền</span>
                        <span className="amount">{formatPrice(currentOrder.totalAmount)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className="result-actions">
                <Button onClick={() => navigate(ROUTES.ORDER_HISTORY)}>
                  Xem đơn hàng
                </Button>
                <Button variant="outline" onClick={() => navigate(ROUTES.HOME)}>
                  Tiếp tục mua sắm
                </Button>
              </div>
            </>
          ) : (
            <>
              <XCircle size={64} className="result-icon failed" />
              <h1>Thanh toán thất bại</h1>
              <p>{backendMessage || 'Không thể xử lý giao dịch của bạn. Vui lòng thử lại.'}</p>
              
              <div className="result-actions">
                <Button variant="outline" onClick={() => loadPaymentInfo()}>
                  Thử lại
                </Button>
                <Button onClick={() => navigate(`/orders/${orderId}`)}>
                  Xem đơn hàng
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // If returning from payment without explicit status, show processing state
  if (isReturningFromPayment && !currentOrder?.isPaid) {
    return (
      <div className="payment-result">
        <div className="payment-result-card info">
          <Clock size={64} className="result-icon info" />
          <h1>Processing Payment</h1>
          <p>Your payment is being processed. This may take a few moments.</p>
          <div className="result-actions">
            <Button onClick={() => loadPaymentInfo()}>
              Refresh Status
            </Button>
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

  // Get payment method, default to 'cod' if not set
  const paymentMethod = currentOrder.paymentMethod || 'cashondelivery';

  // Already paid
  if (currentOrder.isPaid) {
    return (
      <div className="payment-result">
        <div className="payment-result-card success">
          <CheckCircle size={64} className="result-icon success" />
          <h1>Already Paid</h1>
          <p>This order has already been paid.</p>
        </div>
      </div>
    );
  }

  // COD orders
  if (paymentMethod === 'cod' || paymentMethod === 'cashondelivery') {
    const backendMessage = paymentResponse?.message;
    
    return (
      <div className="payment-result">
        <div className="payment-result-card success">
          <CheckCircle size={64} className="result-icon success" />
          <h1>Đặt hàng thành công!</h1>
          <p>{backendMessage || 'Bạn sẽ thanh toán khi nhận hàng.'}</p>
          <div className="order-summary">
            <div className="summary-row">
              <span>Mã đơn hàng</span>
              <span className="detail-value">#{currentOrder._id || currentOrder.id || orderId}</span>
            </div>
            <div className="summary-row">
              <span>Phương thức thanh toán</span>
              <span className="detail-value">Thanh toán khi nhận hàng</span>
            </div>
            <div className="summary-row">
              <span>Tổng tiền</span>
              <span className="amount">{formatPrice(currentOrder.totalAmount)}</span>
            </div>
          </div>
          <div className="result-actions">
            <Button onClick={() => navigate(ROUTES.ORDER_HISTORY)}>
              Xem đơn hàng
            </Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.HOME)}>
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // VietQR payment
  if (paymentMethod === 'vietqr' && qrCode) {
    const qrUrl = qrCode.qrUrl || qrCode.qrDataURL || qrCode.bill;
    const displayOrderId = currentOrder._id || currentOrder.id || orderId;
    const displayAmount = normalizeAmount(currentOrder, qrCode);

    return (
      <div className="payment-container">
        <div className="payment-card">
          <div className="payment-header">
            <QrCode size={32} />
            <h1>VietQR Payment</h1>
            <p>Scan QR code with your banking app to complete payment</p>
          </div>

          <div className="qr-section">
            {qrUrl ? (
              <img src={qrUrl} alt="VietQR Code" className="qr-code-image" />
            ) : (
              <div className="qr-placeholder">QR code not available</div>
            )}
          </div>

          <div className="payment-details">
            <h3>Payment Details</h3>
            <div className="detail-row">
              <span>Order ID</span>
              <span className="detail-value">#{displayOrderId}</span>
            </div>
            <div className="detail-row">
              <span>Amount</span>
              <span className="detail-value amount">
                {displayAmount !== null ? formatPrice(displayAmount) : '—'}
              </span>
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
            {qrUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(qrUrl, '_blank')}
              >
                Open QR in new tab
              </Button>
            )}
            <Button
              onClick={handleConfirmPayment}
              disabled={confirming}
              className="confirm-button"
            >
              {confirming ? (
                <>
                  <LoadingSpinner size="xs" variant="button" />
                  <span className="ml-2">Confirming...</span>
                </>
              ) : (
                "I've Transferred"
              )}
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
