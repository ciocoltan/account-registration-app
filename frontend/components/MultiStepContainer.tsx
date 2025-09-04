import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Stepper from './Stepper';
import LogoutButton from './LogoutButton';

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
  const [highestMainStepReached, setHighestMainStepReached] = useState(1);

  const currentPath = location.pathname.split('/').pop() || stepFlow[0];
  const currentStepInfo = stepDetails[currentPath] || stepDetails[stepFlow[0]];

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
