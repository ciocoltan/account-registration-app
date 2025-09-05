import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Stepper from './Stepper';
import LogoutButton from './LogoutButton';
import { useFormData } from '../contexts/FormDataContext';

const stepFlow = [
  'personal-details', 'residence-address', 'public-official-status',
  'employment-status', 'industry', 'annual-income', 'available-to-invest', 'plan-to-invest', 'investment-source',
  'professional-experience', 'risk-tolerance', 'trading-objective',
  'verification'
];

const stepDetails: Record<string, { mainStep: number, subStep: number }> = {
  'personal-details': { mainStep: 1, subStep: 0 },
  'residence-address': { mainStep: 1, subStep: 1 },
  'public-official-status': { mainStep: 1, subStep: 2 },
  'employment-status': { mainStep: 2, subStep: 0 },
  'industry': { mainStep: 2, subStep: 1 },
  'annual-income': { mainStep: 2, subStep: 2 },
  'available-to-invest': { mainStep: 2, subStep: 3 },
  'plan-to-invest': { mainStep: 2, subStep: 4 },
  'investment-source': { mainStep: 2, subStep: 5 },
  'professional-experience': { mainStep: 3, subStep: 0 },
  'risk-tolerance': { mainStep: 3, subStep: 1 },
  'trading-objective': { mainStep: 3, subStep: 2 },
  'verification': { mainStep: 4, subStep: 0 },
};

const substepsPerStep: Record<string, number> = { '1': 3, '2': 6, '3': 3, '4': 1 };

function MultiStepContainer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, updateFormData, isLoading } = useFormData();
  const [highestMainStepReached, setHighestMainStepReached] = useState(1);
  const [hasCheckedSavedData, setHasCheckedSavedData] = useState(false);

  const currentPath = location.pathname.split('/').pop() || stepFlow[0];
  const currentStepInfo = stepDetails[currentPath] || stepDetails[stepFlow[0]];

  // Check for saved form data and redirect to appropriate step
  useEffect(() => {
    if (!isLoading && !hasCheckedSavedData) {
      setHasCheckedSavedData(true);
      
      if (formData.currentStep && formData.currentStep !== currentPath) {
        console.log('Redirecting to saved step:', formData.currentStep);
        navigate(`/en/apply/${formData.currentStep}`, { replace: true });
        return;
      }
      
      // If no saved step but has data, figure out the furthest step with data
      if (!formData.currentStep && Object.keys(formData).length > 1) {
        let furthestStep = 'personal-details';
        
        if (formData['first-name'] && formData['last-name']) furthestStep = 'residence-address';
        if (formData.residenceCountry) furthestStep = 'public-official-status';
        if (formData.publicOfficialStatus) furthestStep = 'employment-status';
        if (formData.employmentStatus) furthestStep = 'industry';
        if (formData.industry) furthestStep = 'annual-income';
        if (formData.annualIncome) furthestStep = 'available-to-invest';
        if (formData.availableToInvest) furthestStep = 'plan-to-invest';
        if (formData.planToInvest) furthestStep = 'investment-source';
        if (formData.investmentSource) furthestStep = 'professional-experience';
        if (formData.professionalExperience) furthestStep = 'risk-tolerance';
        if (formData.riskTolerance) furthestStep = 'trading-objective';
        if (formData.tradingObjective) furthestStep = 'verification';
        
        if (furthestStep !== currentPath) {
          console.log('Redirecting to furthest completed step:', furthestStep);
          navigate(`/en/apply/${furthestStep}`, { replace: true });
        }
      }
    }
  }, [isLoading, hasCheckedSavedData, formData, currentPath, navigate]);

  // Update current step in form data when path changes
  useEffect(() => {
    if (hasCheckedSavedData && currentPath) {
      updateFormData({ currentStep: currentPath });
    }
  }, [currentPath, hasCheckedSavedData, updateFormData]);

  useEffect(() => {
    setHighestMainStepReached(prev => Math.max(prev, currentStepInfo.mainStep));
  }, [currentStepInfo.mainStep]);

  const goToStep = (step: number) => {
    if (step <= highestMainStepReached) {
      const targetPath = stepFlow.find(path => stepDetails[path].mainStep === step && stepDetails[path].subStep === 0);
      if (targetPath) {
        navigate(`/en/apply/${targetPath}`);
      }
    }
  };

  // Show loading while checking saved data
  if (isLoading || !hasCheckedSavedData) {
    return (
      <div className="bg-white p-12 rounded-xl w-full max-w-3xl border border-gray-200 relative">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-12 rounded-xl w-full max-w-3xl border border-gray-200 relative">
      <LogoutButton />
      
      <Stepper
        currentMainStep={currentStepInfo.mainStep}
        currentSubStep={currentStepInfo.subStep}
        substepsPerStep={substepsPerStep}
        highestMainStepReached={highestMainStepReached}
        onStepClick={goToStep}
      />
      
      <div className="max-w-md mx-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default MultiStepContainer;
