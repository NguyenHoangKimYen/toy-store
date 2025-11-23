import React from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, ArrowLeft } from 'lucide-react'
import { PasswordInput } from '../common/PasswordInput'
import { LoadingSpinner } from '@/components/common'

export const Step3Password = ({ 
  formData, 
  validationErrors, 
  touchedFields,
  passwordStrength,
  loading,
  onInputChange, 
  onBlur, 
  onSubmit,
  onBack 
}) => {
  const isStepValid = formData.password && formData.confirmPassword && 
    !validationErrors.password && !validationErrors.confirmPassword && 
    passwordStrength?.strength >= 60

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">Secure Your Account</h3>
        <p className="text-sm text-white/70 mt-1">Create a strong password</p>
      </div>

      {/* Password with Strength Meter */}
      <div className='space-y-2'>
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={onInputChange}
          onBlur={onBlur}
          error={validationErrors.password}
          touched={touchedFields.password}
        />
        
        {/* Password Strength Meter */}
        {formData.password && passwordStrength && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i < (passwordStrength.strength / 20)
                      ? passwordStrength.strength < 40
                        ? 'bg-red-500'
                        : passwordStrength.strength < 80
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-semibold ${
              passwordStrength.strength < 40 ? 'text-red-300' :
              passwordStrength.strength < 80 ? 'text-orange-300' :
              'text-green-300'
            }`}>
              {passwordStrength.strength < 40 ? 'Weak password' :
               passwordStrength.strength < 80 ? 'Medium password' :
               'Strong password'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-300' : 'text-white/40'}`}>
                {passwordStrength.checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                8+ characters
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
        
        {touchedFields.password && validationErrors.password && (
          <p className="text-xs text-red-300 flex items-center gap-1">
            <X className="w-3 h-3" />
            {validationErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className='space-y-2'>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword || ''}
          onChange={onInputChange}
          onBlur={onBlur}
          error={validationErrors.confirmPassword}
          touched={touchedFields.confirmPassword}
        />
        {touchedFields.confirmPassword && validationErrors.confirmPassword && (
          <p className="text-xs text-red-300 flex items-center gap-1">
            <X className="w-3 h-3" />
            {validationErrors.confirmPassword}
          </p>
        )}
        {touchedFields.confirmPassword && !validationErrors.confirmPassword && formData.confirmPassword && (
          <p className="text-xs text-green-300 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Passwords match
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          disabled={loading}
          className="flex-1 h-12 bg-white/5 border-white/40 hover:bg-white/15 text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)] backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={loading || !isStepValid}
          className="flex-1 h-12 bg-white/90 hover:bg-white text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all border border-white/50 backdrop-blur-sm"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" variant="button" />
              <span className="ml-2">Creating...</span>
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>

      {passwordStrength?.strength < 60 && formData.password && (
        <p className="text-xs text-center text-orange-300">
          Please create a stronger password to continue
        </p>
      )}
    </div>
  )
}
