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

  // Extract the actual step from the current path
  const getCurrentStepFromPath = () => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Check if this is a valid step
    if (stepFlow.includes(lastPart)) {
      return lastPart;
    }
    
    // Default to first step if path is invalid
    return stepFlow[0];
  };

  const currentPath = getCurrentStepFromPath();
  const currentStepInfo = stepDetails[currentPath] || stepDetails[stepFlow[0]];

  // Check for saved form data and redirect to appropriate step
  useEffect(() => {
    if (!isLoading && !hasCheckedSavedData) {
      setHasCheckedSavedData(true);
      
      console.log('Checking saved form data...', formData);
      
      // If we have a saved currentStep that's different from current path, redirect
      if (formData.currentStep && 
          formData.currentStep !== currentPath && 
          stepFlow.includes(formData.currentStep)) {
        console.log('Redirecting to saved step:', formData.currentStep);
        navigate(`/en/apply/${formData.currentStep}`, { replace: true });
        return;
      }
      
      // If no saved step but has significant form data, find the furthest completed step
      if (!formData.currentStep && Object.keys(formData).length > 2) { // More than just currentStep and lastUpdated
        let furthestStep = 'personal-details';
        
        // Check which steps have been completed based on data
        if (formData['first-name'] && formData['last-name'] && formData.phone) {
          furthestStep = 'residence-address';
        }
        if (formData.residenceCountry && formData.notUsCitizen && formData.agreedToTerms) {
          furthestStep = 'public-official-status';
        }
        if (formData.publicOfficialStatus) {
          furthestStep = 'employment-status';
        }
        if (formData.employmentStatus) {
          furthestStep = 'industry';
        }
        if (formData.industry) {
          furthestStep = 'annual-income';
        }
        if (formData.annualIncome) {
          furthestStep = 'available-to-invest';
        }
        if (formData.availableToInvest) {
          furthestStep = 'plan-to-invest';
        }
        if (formData.planToInvest) {
          furthestStep = 'investment-source';
        }
        if (formData.investmentSource) {
          furthestStep = 'professional-experience';
        }
        if (formData.professionalExperience) {
          furthestStep = 'risk-tolerance';
        }
        if (formData.riskTolerance) {
          furthestStep = 'trading-objective';
        }
        if (formData.tradingObjective) {
          furthestStep = 'verification';
        }
        
        if (furthestStep !== currentPath) {
          console.log('Redirecting to furthest completed step:', furthestStep);
          navigate(`/en/apply/${furthestStep}`, { replace: true });
          return;
        }
      }
      
      // If we're on the base /en/apply path, redirect to personal-details
      if (location.pathname === '/en/apply' || location.pathname === '/en/apply/') {
        console.log('Redirecting from base path to personal-details');
        navigate('/en/apply/personal-details', { replace: true });
        return;
      }
    }
  }, [isLoading, hasCheckedSavedData, formData, currentPath, navigate, location.pathname]);

  // Update current step in form data when path changes (only after initial check)
  useEffect(() => {
    if (hasCheckedSavedData && currentPath && stepFlow.includes(currentPath)) {
      console.log('Updating current step to:', currentPath);
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

  // Show loading state while checking saved data
  if (!hasCheckedSavedData || isLoading) {
    return (
      <div className="bg-white p-12 rounded-xl w-full max-w-3xl border border-gray-200 relative">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">Loading your application...</p>
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
