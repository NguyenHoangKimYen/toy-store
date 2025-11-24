import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common';
import { toast } from 'sonner';

/**
 * GuestRoute component to block authenticated users from accessing auth pages
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @returns {React.ReactNode}
 */
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show toast notification when authenticated user tries to access
  useEffect(() => {
    if (user) {
      toast.error('You must be logged out first', {
        position: "top-center",
        duration: 3000,
      });
    }
  }, [user]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to home if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
