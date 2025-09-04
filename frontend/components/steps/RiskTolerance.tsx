import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  [key: string]: string | boolean;
}

interface RiskToleranceProps {
  formData?: FormData;
  onSaveData?: (data: FormData) => void;
  onNext?: () => void;
}

function RiskTolerance({ formData = {}, onSaveData, onNext }: RiskToleranceProps) {
  const navigate = useNavigate();

  const handleOptionClick = (value: string) => {
    onSaveData?.({ riskTolerance: value });
    setTimeout(() => {
      if (onNext) {
        onNext();
      } else {
        navigate('/en/apply/trading-objective');
      }
    }, 200);
  };

  const options = [
    { value: 'small', label: 'Small losses' },
    { value: 'moderate', label: 'Moderate losses' },
  ];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">What is your acceptable risk tolerance when trading?</h2>
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

export default RiskTolerance;
