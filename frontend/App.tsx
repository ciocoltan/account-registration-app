import React, { useEffect, useState } from 'react';
import AuthContainer from './components/AuthContainer';
import MultiStepContainer from './components/MultiStepContainer';
import backend from '~backend/client';

interface OnboardingStatus {
  userCurrentStep?: number;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    handleSession();
  }, []);

  const handleSession = async () => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      try {
        const response = await backend.onboarding.getStatus();
        setIsAuthenticated(true);
        setCurrentStep(response.userCurrentStep || 0);
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('jwt');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const onAuthSuccess = () => {
    handleSession();
  };

  if (isLoading) {
    return (
      <div className="bg-white flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white flex items-center justify-center min-h-screen p-4 overflow-hidden">
      {!isAuthenticated ? (
        <AuthContainer onAuthSuccess={onAuthSuccess} />
      ) : (
        <MultiStepContainer initialStep={currentStep} />
      )}
    </div>
  );
}

export default App;
