import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check, X, ArrowRight, Loader2 } from 'lucide-react'

export const Step1BasicInfo = ({ 
  formData, 
  validationErrors, 
  touchedFields,
  checkingAvailability = {},
  onInputChange, 
  onBlur, 
  onNext 
}) => {
  const isStepValid = formData.fullname && formData.username && 
    !validationErrors.fullname && !validationErrors.username &&
    !checkingAvailability.username

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">Basic Information</h3>
        <p className="text-sm text-white/70 mt-1">Tell us about yourself</p>
      </div>

      {/* Full Name */}
      <div className='space-y-2'>
        <Label htmlFor="fullname" className="text-sm font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">Full Name</Label>
        <div className="relative">
          <Input
            id="fullname"
            name="fullname"
            type="text"
            placeholder="John Doe"
            value={formData.fullname}
            onChange={onInputChange}
            onBlur={onBlur}
            className={`pr-10 transition-all bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 ${
              touchedFields.fullname
                ? validationErrors.fullname
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-green-400 focus:ring-green-400'
                : ''
            }`}
            required
          />
          {touchedFields.fullname && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validationErrors.fullname ? (
                <X className="w-5 h-5 text-red-500" />
              ) : (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        {touchedFields.fullname && validationErrors.fullname && (
          <p className="text-xs text-red-300 flex items-center gap-1">
            <X className="w-3 h-3" />
            {validationErrors.fullname}
          </p>
        )}
      </div>

      {/* Username */}
      <div className='space-y-2'>
        <Label htmlFor="username" className="text-sm font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">Username</Label>
        <div className="relative">
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe123"
            value={formData.username}
            onChange={onInputChange}
            onBlur={onBlur}
            className={`pr-10 transition-all bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 ${
              touchedFields.username
                ? validationErrors.username
                  ? 'border-red-400 focus:ring-red-400'
                  : checkingAvailability.username
                  ? 'border-blue-400 focus:ring-blue-400'
                  : 'border-green-400 focus:ring-green-400'
                : ''
            }`}
            required
          />
          {touchedFields.username && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checkingAvailability.username ? (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              ) : validationErrors.username ? (
                <X className="w-5 h-5 text-red-500" />
              ) : (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        {checkingAvailability.username && (
          <p className="text-xs text-blue-300 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Checking availability...
          </p>
        )}
        {touchedFields.username && validationErrors.username && !checkingAvailability.username && (
          <p className="text-xs text-red-300 flex items-center gap-1">
            <X className="w-3 h-3" />
            {validationErrors.username}
          </p>
        )}
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={!isStepValid}
        className="w-full h-12 bg-white/90 hover:bg-white text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all border border-white/50 backdrop-blur-sm"
      >
        Continue
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  )
}
