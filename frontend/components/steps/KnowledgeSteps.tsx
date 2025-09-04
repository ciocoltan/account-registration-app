import React from 'react';
import { FormData } from '../MultiStepContainer';

interface KnowledgeStepsProps {
  stepId: string;
  formData: FormData;
  onSaveData: (data: FormData) => void;
  onNext: () => void;
}

function KnowledgeSteps({ stepId, formData, onSaveData, onNext }: KnowledgeStepsProps) {
  const handleOptionClick = (value: string, fieldName: string) => {
    onSaveData({ [fieldName]: value });
    setTimeout(onNext, 200);
  };

  const stepConfigs = {
    '3-0': {
      title: 'Do you have professional or academic experience...',
      fieldName: 'professionalExperience',
      options: [
        { value: 'over-3-years', label: 'Over 3 years of directly relevant experience' },
        { value: 'under-3-years', label: 'Under 3 years of directly relevant experience' },
        { value: 'none', label: 'No, none' },
      ]
    },
    '3-1': {
      title: 'What is your acceptable risk tolerance when trading?',
      fieldName: 'riskTolerance',
      options: [
        { value: 'small', label: 'Small losses' },
        { value: 'moderate', label: 'Moderate losses' },
      ]
    },
    '3-2': {
      title: 'What is your trading objective?',
      fieldName: 'tradingObjective',
      options: [
        { value: 'short-term', label: 'Short term investments' },
        { value: 'long-term', label: 'Long term investments' },
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

export default KnowledgeSteps;
