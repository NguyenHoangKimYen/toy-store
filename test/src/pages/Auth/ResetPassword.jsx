import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/services/config';
import { ROUTES } from '@/config/routes';
import { AuthLayout } from './common/AuthLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle2, Check, X } from 'lucide-react';
import { PasswordInput } from './common/PasswordInput';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('uid');
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    const strength = (passed / 4) * 100;
    return { checks, strength, passed };
  };

  const passwordStrength = newPassword ? checkPasswordStrength(newPassword) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !token) {
      toast.error('Reset link is invalid or has expired.');
      return;
    }

    if (newPassword.length < 12) {
      toast.error('Password must be at least 12 characters.');
      return;
    }

    if (newPassword.length > 32) {
      toast.error('Password must not exceed 32 characters.');
      return;
    }

    if (passwordStrength?.strength !== 100) {
      toast.error('Password must meet all complexity requirements.');
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
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  label="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
                
                {/* Password Strength Meter */}
                {newPassword && passwordStrength && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength.passed
                              ? passwordStrength.strength < 50
                                ? 'bg-red-500'
                                : passwordStrength.strength < 100
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${
                      passwordStrength.strength < 50 ? 'text-red-300' :
                      passwordStrength.strength < 100 ? 'text-orange-300' :
                      'text-green-300'
                    }`}>
                      {passwordStrength.strength < 50 ? 'Weak password' :
                       passwordStrength.strength < 100 ? 'Medium password' :
                       'Strong password'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-300' : 'text-white/40'}`}>
                        {passwordStrength.checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        12+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-300' : 'text-white/40'}`}>
                        {passwordStrength.checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Uppercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-green-300' : 'text-white/40'}`}>
                        {passwordStrength.checks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Lowercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-green-300' : 'text-white/40'}`}>
                        {passwordStrength.checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-300 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-300 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || passwordStrength?.strength !== 100}
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
            <div className="text-xs text-white/70">
              Password must meet all 4 requirements above
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
