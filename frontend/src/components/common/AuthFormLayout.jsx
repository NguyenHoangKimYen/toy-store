import React from 'react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

/**
 * Reusable Authentication Form Layout
 * Reduces duplication between Login and Signup pages
 */
const AuthFormLayout = ({ 
  title, 
  description, 
  children, 
  footerLinks,
  className = ''
}) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className={`w-[450px] shadow-lg border border-gray-300 dark:border-gray-800 bg-gray-100 ${className}`}>
        <CardHeader>
          <CardTitle className="text-2xl text-center font-semibold">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {children}
        </CardContent>

        {footerLinks && (
          <CardFooter className="text-sm text-center text-gray-600 dark:text-gray-400 flex flex-col gap-2">
            {footerLinks.map((link, index) => (
              <Link 
                key={index} 
                to={link.to} 
                className="hover:underline text-blue-600 dark:text-blue-400"
              >
                {link.text}
              </Link>
            ))}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default AuthFormLayout;
