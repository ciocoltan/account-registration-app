import React from 'react';
import { FormData } from '../MultiStepContainer';

interface IndustryProps {
  formData: FormData;
  onSaveData: (data: FormData) => void;
  onNext: () => void;
}

function Industry({ formData, onSaveData, onNext }: IndustryProps) {
  const handleOptionClick = (value: string) => {
    onSaveData({ industry: value });
    setTimeout(onNext, 200);
  };

  const options = [
    { value: 'accountancy', label: 'Accountancy' },
    { value: 'airline', label: 'Airline Services' },
    { value: 'armed', label: 'Armed Services' },
  ];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">What industry do you work in?</h2>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleOptionClick(option.value)}
            className="step-option-btn w-full py-3 px-4 rounded-full bg-blue-50 text-gray-800 border border-transparent font-medium text-center transition-colors duration-200 hover:bg-blue-100"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Industry;
