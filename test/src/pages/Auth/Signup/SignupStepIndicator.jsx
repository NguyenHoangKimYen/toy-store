import React from 'react'
import { Check } from 'lucide-react'

export const SignupStepIndicator = ({ currentStep, totalSteps = 3 }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep
        
        return (
          <React.Fragment key={stepNum}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${
              isCompleted 
                ? 'bg-green-500 text-white' 
                : isCurrent 
                ? 'bg-white text-gray-900 ring-2 ring-white/50' 
                : 'bg-white/20 text-white/60'
            }`}>
              {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
            </div>
            {stepNum < totalSteps && (
              <div className={`h-0.5 w-12 transition-all ${
                isCompleted ? 'bg-green-500' : 'bg-white/20'
              }`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
