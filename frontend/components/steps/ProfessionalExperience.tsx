import React from 'react';
import { FormData } from '../MultiStepContainer';

interface ProfessionalExperienceProps {
  formData: FormData;
  onSaveData: (data: FormData) => void;
  onNext: () => void;
}

function ProfessionalExperience({ formData, onSaveData, onNext }: ProfessionalExperienceProps) {
  const handleOptionClick = (value: string) => {
    onSaveData({ professionalExperience: value });
    setTimeout(onNext, 200);
  };

  const options = [
    { value: 'over-3-years', label: 'Over 3 years of directly relevant experience' },
    { value: 'under-3-years', label: 'Under 3 years of directly relevant experience' },
    { value: 'none', label: 'No, none' },
  ];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Do you have professional or academic experience...</h2>
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

export default ProfessionalExperience;
