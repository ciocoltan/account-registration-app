import React from 'react';
import PersonalDetailsSteps from './steps/PersonalDetailsSteps';
import FinancialSteps from './steps/FinancialSteps';
import KnowledgeSteps from './steps/KnowledgeSteps';
import VerificationStep from './steps/VerificationStep';
import { FormData } from './MultiStepContainer';

interface StepContentProps {
  stepId: string;
  formData: FormData;
  onSaveData: (data: FormData) => void;
  onNext: () => void;
  onInitiateKyc: () => void;
}

function StepContent({ stepId, formData, onSaveData, onNext, onInitiateKyc }: StepContentProps) {
  const [mainStep] = stepId.split('-');

  switch (mainStep) {
    case '1':
      return (
        <PersonalDetailsSteps
          stepId={stepId}
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '2':
      return (
        <FinancialSteps
          stepId={stepId}
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '3':
      return (
        <KnowledgeSteps
          stepId={stepId}
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '4':
      return (
        <VerificationStep
          onInitiateKyc={onInitiateKyc}
        />
      );
    default:
      return <div>Step not found</div>;
  }
}

export default StepContent;
