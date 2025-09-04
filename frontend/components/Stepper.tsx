import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentMainStep: number;
  currentSubStep: number;
  substepsPerStep: Record<string, number>;
  highestMainStepReached: number;
  onStepClick: (step: number) => void;
}

function Stepper({ 
  currentMainStep, 
  currentSubStep, 
  substepsPerStep, 
  highestMainStepReached,
  onStepClick 
}: StepperProps) {
  const steps = [
    { number: 1, name: 'Personal details' },
    { number: 2, name: 'Financial information' },
    { number: 3, name: 'Knowledge and experience' },
    { number: 4, name: 'Verification' },
  ];

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentMainStep) return 'completed';
    if (stepNumber === currentMainStep) return 'active';
    if (stepNumber <= highestMainStepReached) return 'visited';
    return 'inactive';
  };

  const getProgressWidth = (stepNumber: number) => {
    if (stepNumber < currentMainStep) return 100;
    if (stepNumber === currentMainStep) {
      const totalSubsteps = substepsPerStep[currentMainStep] || 1;
      return totalSubsteps > 1 ? (currentSubStep / (totalSubsteps - 1)) * 100 : 0;
    }
    return 0;
  };

  return (
    <div className="flex items-start mb-12">
      {steps.map((step, index) => {
        const status = getStepStatus(step.number);
        const progressWidth = getProgressWidth(step.number);
        const isClickable = step.number <= highestMainStepReached;

        return (
          <div
            key={step.number}
            className={`stepper-item flex flex-col items-center flex-1 relative ${
              isClickable ? 'cursor-pointer' : ''
            }`}
            onClick={() => isClickable && onStepClick(step.number)}
          >
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute top-6 left-1/2 w-full h-2 bg-gray-100 z-0">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            )}
            
            {/* Step counter */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg z-10 relative border-3 transition-all duration-300
              ${status === 'active' ? 'bg-blue-600 text-white border-blue-600' : ''}
              ${status === 'completed' ? 'bg-blue-600 text-white border-blue-600' : ''}
              ${status === 'visited' ? 'bg-white text-blue-600 border-blue-600' : ''}
              ${status === 'inactive' ? 'bg-white text-gray-500 border-gray-300' : ''}
            `}>
              {status === 'completed' ? (
                <Check className="h-6 w-6" />
              ) : (
                step.number
              )}
            </div>
            
            {/* Step name */}
            <div className={`
              mt-2 text-sm font-medium text-center transition-colors duration-300
              ${status === 'active' || status === 'completed' || status === 'visited' ? 'text-gray-800' : 'text-gray-500'}
            `}>
              {step.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
