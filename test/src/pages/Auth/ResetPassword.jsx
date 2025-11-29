import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/services/config';
import { ROUTES } from '@/config/routes';
import { AuthLayout } from './common/AuthLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('uid');
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !token) {
      toast.error('Reset link is invalid or has expired.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to reset password.');

      toast.success('Password reset successful! Please sign in again.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error(err.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const invalidLink = !userId || !token;

  return (
    <AuthLayout>
      <Card className="w-full max-w-[480px] mx-auto shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl animate-in fade-in duration-500">
        <CardHeader className="space-y-4 pb-6 text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 rounded-full">
              {invalidLink ? (
                <Lock className="w-12 h-12 text-red-500" />
              ) : (
                <Lock className="w-12 h-12 text-blue-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white [text-shadow:_0_2px_8px_rgb(0_0_0_/_40%)]">
            {invalidLink ? 'Invalid link' : 'Reset password'}
          </CardTitle>
          <CardDescription className="text-white/95 text-base [text-shadow:_0_1px_4px_rgb(0_0_0_/_30%)]">
            {invalidLink
              ? 'Please check your email or request a new link.'
              : 'Enter your new password and confirm to continue.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {invalidLink ? (
            <div className="space-y-4 text-center text-white">
              <p>The link you followed is missing required information.</p>
              <Button asChild className="w-full bg-white/90 hover:bg-white text-gray-900 font-semibold shadow-lg border border-white/50 backdrop-blur-sm">
                <Link to={ROUTES.LOGIN}>Back to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">
                  New password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-white/90 hover:bg-white text-gray-900 font-semibold shadow-lg border border-white/50 backdrop-blur-sm"
                size="lg"
              >
                {loading ? 'Processing...' : 'Update password'}
              </Button>
            </form>
          )}
        </CardContent>

        {!invalidLink && (
          <CardFooter className="flex flex-col gap-2 text-sm text-white/90 text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Password must be at least 8 characters</span>
            </div>
            <Link to={ROUTES.LOGIN} className="text-white hover:text-white/90 underline">
              Back to login
            </Link>
          </CardFooter>
        )}
      </Card>
    </AuthLayout>
  );
};

export default ResetPassword;
