import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common';

/**
 * ProtectedRoute component to guard routes that require authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {boolean} props.adminOnly - If true, only users with 'admin' role can access
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin role if required
  if (adminOnly && user.role !== 'admin') {
    // Redirect non-admin users to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
