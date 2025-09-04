import React, { useState, useEffect } from 'react';
import Stepper from './Stepper';
import StepContent from './StepContent';
import backend from '~backend/client';

interface MultiStepContainerProps {
  initialStep: number;
}

export interface FormData {
  [key: string]: string | boolean;
}

const stepFlow = ['1-0', '1-1', '1-2', '2-0', '2-1', '2-2', '2-3', '2-4', '2-5', '3-0', '3-1', '3-2', '4-0'];
const substepsPerStep: Record<string, number> = { '1': 3, '2': 6, '3': 3, '4': 1 };

function MultiStepContainer({ initialStep }: MultiStepContainerProps) {
  const [formData, setFormData] = useState<FormData>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highestMainStepReached, setHighestMainStepReached] = useState(1);

  useEffect(() => {
    const stepMap = [0, 0, 3, 9, 12]; // API step to flow index mapping
    const mappedIndex = stepMap[initialStep] || 0;
    setCurrentStepIndex(mappedIndex);
    setHighestMainStepReached(Math.max(1, initialStep));
  }, [initialStep]);

  const saveStepData = (data: FormData) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const saveCurrentStepToBackend = async (stepId: string, data: FormData) => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return;

    try {
      // Save data based on step
      if (stepId.startsWith('1-')) {
        await backend.onboarding.saveStep1({ data });
      } else if (stepId.startsWith('2-')) {
        await backend.onboarding.saveStep2({ data });
      } else if (stepId.startsWith('3-')) {
        await backend.onboarding.saveStep3({ data });
      }
    } catch (error) {
      console.error(`Error saving ${stepId} data:`, error);
    }
  };

  const goToNextStep = async () => {
    const currentStepId = stepFlow[currentStepIndex];
    
    // Save current step data to backend
    await saveCurrentStepToBackend(currentStepId, formData);

    if (currentStepIndex < stepFlow.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const newMainStep = parseInt(stepFlow[nextIndex].split('-')[0]);
      
      setCurrentStepIndex(nextIndex);
      setHighestMainStepReached(Math.max(highestMainStepReached, newMainStep));
    }
  };

  const goToStep = (step: number) => {
    if (step <= highestMainStepReached) {
      const stepMap = [0, 0, 3, 9, 12];
      const targetIndex = stepMap[step] || stepFlow.findIndex(s => s.startsWith(step + '-'));
      if (targetIndex !== -1) {
        setCurrentStepIndex(targetIndex);
      }
    }
  };

  const initiateKyc = async () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return;

    try {
      const response = await backend.kyc.initiate();
      console.log('KYC Access Token:', response.accessToken);
      alert('KYC process initiated. Check console for token.');
      // Here you would initialize the Sumsub SDK with the token
    } catch (error) {
      console.error('KYC initiation failed:', error);
      alert('Failed to initiate KYC.');
    }
  };

  const currentStepId = stepFlow[currentStepIndex];
  const [mainStep, subStep] = currentStepId.split('-').map(Number);

  return (
    <div className="bg-white p-12 rounded-xl w-full max-w-3xl border border-gray-200">
      <Stepper
        currentMainStep={mainStep}
        currentSubStep={subStep}
        substepsPerStep={substepsPerStep}
        highestMainStepReached={highestMainStepReached}
        onStepClick={goToStep}
      />
      
      <div className="max-w-md mx-auto">
        <StepContent
          stepId={currentStepId}
          formData={formData}
          onSaveData={saveStepData}
          onNext={goToNextStep}
          onInitiateKyc={initiateKyc}
        />
      </div>
    </div>
  );
}

export default MultiStepContainer;
