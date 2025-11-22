import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { SignupStepIndicator } from './SignupStepIndicator'
import { Step1BasicInfo } from './Step1BasicInfo'
import { Step2ContactInfo } from './Step2ContactInfo'
import { Step3Password } from './Step3Password'
import { OAuthButtons } from '../OAuthButtons'

export const SignupForm = ({ 
  formData, 
  validationErrors, 
  touchedFields,
  passwordStrength,
  loading,
  onInputChange, 
  onBlur, 
  onSubmit 
}) => {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SignupStepIndicator currentStep={currentStep} />

      {currentStep === 1 && (
        <Step1BasicInfo
          formData={formData}
          validationErrors={validationErrors}
          touchedFields={touchedFields}
          onInputChange={onInputChange}
          onBlur={onBlur}
          onNext={handleNextStep}
        />
      )}

      {currentStep === 2 && (
        <Step2ContactInfo
          formData={formData}
          validationErrors={validationErrors}
          touchedFields={touchedFields}
          onInputChange={onInputChange}
          onBlur={onBlur}
          onNext={handleNextStep}
          onBack={handlePrevStep}
        />
      )}

      {currentStep === 3 && (
        <Step3Password
          formData={formData}
          validationErrors={validationErrors}
          touchedFields={touchedFields}
          passwordStrength={passwordStrength}
          loading={loading}
          onInputChange={onInputChange}
          onBlur={onBlur}
          onSubmit={handleSubmit}
          onBack={handlePrevStep}
        />
      )}

      {currentStep === 1 && (
        <>
          <OAuthButtons />
          
          <p className="text-sm text-center text-white/80 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-white hover:underline [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">
              Sign in
            </Link>
          </p>
        </>
      )}

      {currentStep === 3 && (
        <p className="text-xs text-center text-white/60 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      )}
    </form>
  )
}
