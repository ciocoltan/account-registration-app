import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  [key: string]: string | boolean;
}

interface InvestmentSourceProps {
  formData?: FormData;
  onSaveData?: (data: FormData) => void;
  onNext?: () => void;
}

function InvestmentSource({ formData = {}, onSaveData, onNext }: InvestmentSourceProps) {
  const navigate = useNavigate();

  const handleOptionClick = (value: string) => {
    onSaveData?.({ investmentSource: value });
    setTimeout(() => {
      if (onNext) {
        onNext();
      } else {
        navigate('/en/apply/professional-experience');
      }
    }, 200);
  };

  const options = [
    { value: 'savings', label: 'Savings' },
    { value: 'salary', label: 'Salary' },
  ];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">What is the source of your investment funds?</h2>
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

export default InvestmentSource;
