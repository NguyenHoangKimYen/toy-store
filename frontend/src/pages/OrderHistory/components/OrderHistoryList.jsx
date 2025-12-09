import React from 'react';
import OrderCard from './OrderCard';

const OrderHistoryList = ({ orders }) => {
  return (
    <div className="order-history-list">
      {orders.map(order => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
};

export default OrderHistoryList;
