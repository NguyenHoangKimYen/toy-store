import React from 'react';
import { useOrderHistory } from './hooks/useOrderHistory';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import OrderHistoryList from './components/OrderHistoryList';
import OrderHistoryFilters from './components/OrderHistoryFilters';
import './OrderHistory.css';

const OrderHistory = () => {
  const {
    orders,
    loading,
    error,
    filters,
    handleFilterChange,
    handleSearch,
    refetch
  } = useOrderHistory();

  if (loading) {
    return (
      <div className="order-history-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-error">
        <ErrorMessage
          title="Failed to load orders"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="order-history-container">
        <div className="order-history-header">
          <h1>Order History</h1>
          <p className="order-count">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>

        <OrderHistoryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found</p>
            <a href="/products" className="shop-now-link">
              Start Shopping
            </a>
          </div>
        ) : (
          <OrderHistoryList orders={orders} />
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
