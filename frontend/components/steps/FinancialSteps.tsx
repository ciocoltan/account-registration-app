import React from 'react';
import { FormData } from '../MultiStepContainer';

interface FinancialStepsProps {
  stepId: string;
  formData: FormData;
  onSaveData: (data: FormData) => void;
  onNext: () => void;
}

function FinancialSteps({ stepId, formData, onSaveData, onNext }: FinancialStepsProps) {
  const handleOptionClick = (value: string, fieldName: string) => {
    onSaveData({ [fieldName]: value });
    setTimeout(onNext, 200);
  };

  const stepConfigs = {
    '2-0': {
      title: 'What is your current employment status?',
      fieldName: 'employmentStatus',
      options: [
        { value: 'employed', label: 'Employed' },
        { value: 'self-employed', label: 'Self-employed' },
        { value: 'retired', label: 'Retired' },
        { value: 'unemployed', label: 'Unemployed' },
        { value: 'student', label: 'Student' },
      ]
    },
    '2-1': {
      title: 'What industry do you work in?',
      fieldName: 'industry',
      options: [
        { value: 'accountancy', label: 'Accountancy' },
        { value: 'airline', label: 'Airline Services' },
        { value: 'armed', label: 'Armed Services' },
      ]
    },
    '2-2': {
      title: 'What is your estimated annual income?',
      fieldName: 'annualIncome',
      options: [
        { value: '<10k', label: 'Less than USD 10,000' },
        { value: '10k-100k', label: 'USD 10,000 - 100,000' },
      ]
    },
    '2-3': {
      title: 'How much do you have available to invest...',
      fieldName: 'availableToInvest',
      options: [
        { value: '<10k', label: 'Less than USD 10,000' },
      ]
    },
    '2-4': {
      title: 'How much do you plan to invest in the next 12 months?',
      fieldName: 'planToInvest',
      options: [
        { value: '<10k', label: 'Less than USD 10,000' },
      ]
    },
    '2-5': {
      title: 'What is the source of your investment funds?',
      fieldName: 'investmentSource',
      options: [
        { value: 'savings', label: 'Savings' },
        { value: 'salary', label: 'Salary' },
      ]
    },
  };

  const config = stepConfigs[stepId as keyof typeof stepConfigs];

  if (!config) {
    return <div>Step not found</div>;
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{config.title}</h2>
      <div className="space-y-3">
        {config.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleOptionClick(option.value, config.fieldName)}
            className="step-option-btn w-full py-3 px-4 rounded-full bg-blue-50 text-gray-800 border border-transparent font-medium text-center transition-colors duration-200 hover:bg-blue-100"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FinancialSteps;
