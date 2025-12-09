import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const is404 = error?.status === 404;
  const is500 = error?.status === 500;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {is404 ? 'Page Not Found' : is500 ? 'Server Error' : 'Oops! Something went wrong'}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {is404 
              ? "The page you're looking for doesn't exist or has been moved."
              : is500
              ? 'We encountered a server error. Please try again later.'
              : error?.message || 'An unexpected error occurred. Please try again.'}
          </p>

          {error?.statusText && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 font-mono">{error.statusText}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700"
            >
              <Home size={16} />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
