import React from 'react';
import { useNavigate } from 'react-router-dom';

function AvailableToInvest() {
  const navigate = useNavigate();

  const handleOptionClick = (value: string) => {
    setTimeout(() => {
      navigate('/en/apply/plan-to-invest');
    }, 200);
  };

  const options = [
    { value: '<10k', label: 'Less than USD 10,000' },
  ];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">How much do you have available to invest...</h2>
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

export default AvailableToInvest;
