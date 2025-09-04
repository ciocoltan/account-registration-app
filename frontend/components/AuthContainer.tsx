import React, { useState } from 'react';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';
import FloatingElements from './FloatingElements';

interface AuthContainerProps {
  onAuthSuccess: () => void;
}

type AuthView = 'registration' | 'login';

function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
  const [currentView, setCurrentView] = useState<AuthView>('registration');

  const showRegistration = () => setCurrentView('registration');
  const showLogin = () => setCurrentView('login');

  return (
    <div className="w-full transition-opacity duration-300">
      {currentView === 'registration' && (
        <RegistrationForm 
          onAuthSuccess={onAuthSuccess}
          onShowLogin={showLogin}
        />
      )}
      
      {currentView === 'login' && (
        <>
          <FloatingElements />
          <LoginForm 
            onAuthSuccess={onAuthSuccess}
            onShowRegister={showRegistration}
          />
        </>
      )}
    </div>
  );
}

export default AuthContainer;
