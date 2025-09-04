import React from 'react';
import PersonalDetails from './steps/PersonalDetails';
import ResidenceAddress from './steps/ResidenceAddress';
import PublicOfficialStatus from './steps/PublicOfficialStatus';
import EmploymentStatus from './steps/EmploymentStatus';
import Industry from './steps/Industry';
import AnnualIncome from './steps/AnnualIncome';
import AvailableToInvest from './steps/AvailableToInvest';
import PlanToInvest from './steps/PlanToInvest';
import InvestmentSource from './steps/InvestmentSource';
import ProfessionalExperience from './steps/ProfessionalExperience';
import RiskTolerance from './steps/RiskTolerance';
import TradingObjective from './steps/TradingObjective';
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
  switch (stepId) {
    case '1-0':
      return (
        <PersonalDetails
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '1-1':
      return (
        <ResidenceAddress
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '1-2':
      return (
        <PublicOfficialStatus
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '2-0':
      return (
        <EmploymentStatus
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '2-1':
      return (
        <Industry
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '2-2':
      return (
        <AnnualIncome
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '2-3':
      return (
        <AvailableToInvest
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '2-4':
      return (
        <PlanToInvest
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '2-5':
      return (
        <InvestmentSource
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '3-0':
      return (
        <ProfessionalExperience
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '3-1':
      return (
        <RiskTolerance
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '3-2':
      return (
        <TradingObjective
          formData={formData}
          onSaveData={onSaveData}
          onNext={onNext}
        />
      );
    case '4-0':
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
