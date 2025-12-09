import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import './NotFoundPage.css';

/**
 * Reusable "Not Found" error page component
 * Use for 404, 403, or any "resource not found/inaccessible" errors
 */
const NotFoundPage = ({
  title = 'Page Not Found',
  message = 'The page you are looking for does not exist or has been moved.',
  icon: CustomIcon,
  showHomeButton = true,
  showBackButton = true,
  homeRoute = ROUTES.HOME,
  homeLabel = 'Go to Home',
  backLabel = 'Go Back',
  onBack,
}) => {
  const navigate = useNavigate();
  const Icon = CustomIcon || AlertCircle;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">
          <Icon size={80} strokeWidth={1.5} />
        </div>
        <h1 className="not-found-title">{title}</h1>
        <p className="not-found-message">{message}</p>
        <div className="not-found-actions">
          {showBackButton && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft size={18} />
              {backLabel}
            </Button>
          )}
          {showHomeButton && (
            <Button onClick={() => navigate(homeRoute)}>
              <Home size={18} />
              {homeLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
