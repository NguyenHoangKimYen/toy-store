import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import './EmptyCart.css';

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="empty-cart">
      <div className="empty-cart-icon">
        <ShoppingBag size={80} strokeWidth={1.5} />
      </div>
      <h2 className="empty-cart-title">Your cart is empty</h2>
      <p className="empty-cart-description">
        Looks like you haven't added anything to your cart yet.
        <br />
        Start shopping to fill it up!
      </p>
      <Button
        size="lg"
        onClick={() => navigate(ROUTES.PRODUCTS)}
        className="start-shopping-btn"
      >
        Start Shopping
      </Button>
    </div>
  );
};

export default EmptyCart;
