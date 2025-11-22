import React from 'react'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Button } from '../../ui/button'
import { Check, X, ArrowRight, ArrowLeft } from 'lucide-react'

export const Step2ContactInfo = ({ 
  formData, 
  validationErrors, 
  touchedFields,
  onInputChange, 
  onBlur, 
  onNext,
  onBack 
}) => {
  const isStepValid = formData.email && formData.phone && 
    !validationErrors.email && !validationErrors.phone

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">Contact Information</h3>
        <p className="text-sm text-white/70 mt-1">How can we reach you?</p>
      </div>

      {/* Email */}
      <div className='space-y-2'>
        <Label htmlFor="email" className="text-sm font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">Email Address</Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={onInputChange}
            onBlur={onBlur}
            className={`pr-10 transition-all bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 ${
              touchedFields.email
                ? validationErrors.email
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-green-400 focus:ring-green-400'
                : ''
            }`}
            required
          />
          {touchedFields.email && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validationErrors.email ? (
                <X className="w-5 h-5 text-red-500" />
              ) : (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        {touchedFields.email && validationErrors.email && (
          <p className="text-xs text-red-300 flex items-center gap-1">
            <X className="w-3 h-3" />
            {validationErrors.email}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">Phone Number</Label>
        <div className="relative">
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="0123456789"
            value={formData.phone}
            onChange={onInputChange}
            onBlur={onBlur}
            className={`pr-10 transition-all bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 ${
              touchedFields.phone
                ? validationErrors.phone
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-green-400 focus:ring-green-400'
                : ''
            }`}
            required
          />
          {touchedFields.phone && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validationErrors.phone ? (
                <X className="w-5 h-5 text-red-500" />
              ) : (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        {touchedFields.phone && validationErrors.phone && (
          <p className="text-xs text-red-300 flex items-center gap-1">
            <X className="w-3 h-3" />
            {validationErrors.phone}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12 bg-white/5 border-white/40 hover:bg-white/15 text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)] backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!isStepValid}
          className="flex-1 h-12 bg-white/90 hover:bg-white text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all border border-white/50 backdrop-blur-sm"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
