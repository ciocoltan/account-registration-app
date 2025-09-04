import React from 'react';
import { useNavigate } from 'react-router-dom';

function EmploymentStatus() {
  const navigate = useNavigate();

  const handleOptionClick = (value: string) => {
    setTimeout(() => {
      navigate('/en/apply/industry');
    }, 200);
  };

  const options = [
    { value: 'employed', label: 'Employed' },
    { value: 'self-employed', label: 'Self-employed' },
    { value: 'retired', label: 'Retired' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'student', label: 'Student' },
  ];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">What is your current employment status?</h2>
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

export default EmploymentStatus;
