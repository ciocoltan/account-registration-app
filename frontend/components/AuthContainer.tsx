import React, { useState } from 'react';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import FloatingElements from './FloatingElements';

interface AuthContainerProps {
  onAuthSuccess: () => void;
}

type AuthView = 'registration' | 'login' | 'forgot-password';

function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
  const [currentView, setCurrentView] = useState<AuthView>('registration');

  const showRegistration = () => setCurrentView('registration');
  const showLogin = () => setCurrentView('login');
  const showForgotPassword = () => setCurrentView('forgot-password');

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
            onShowForgotPassword={showForgotPassword}
          />
        </>
      )}

      {currentView === 'forgot-password' && (
        <>
          <FloatingElements />
          <ForgotPasswordForm 
            onShowLogin={showLogin}
            onShowRegister={showRegistration}
          />
        </>
      )}
    </div>
  );
}

export default AuthContainer;
