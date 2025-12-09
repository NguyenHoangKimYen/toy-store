import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

/**
 * A reusable dialog that prompts users to login or signup
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onOpenChange - Callback when open state changes
 * @param {string} action - The action that requires login (e.g., "like this review", "add to cart")
 * @param {string} returnPath - Optional path to return to after login
 */
const LoginPromptDialog = ({ 
  open, 
  onOpenChange, 
  action = 'perform this action',
  returnPath = window.location.pathname 
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onOpenChange(false);
    navigate('/login', { state: { from: returnPath } });
  };

  const handleSignup = () => {
    onOpenChange(false);
    navigate('/signup', { state: { from: returnPath } });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-center">
            Login Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-600 mt-2">
            You need to be logged in to {action}. Please login or create an account to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            Login
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleSignup}
            className="w-full flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            Create Account
          </Button>
        </div>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoginPromptDialog;
