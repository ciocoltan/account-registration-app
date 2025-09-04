import React, { useState } from 'react';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import FloatingElements from './FloatingElements';

type AuthView = 'registration' | 'login' | 'forgot-password';

function AuthContainer() {
  const [currentView, setCurrentView] = useState<AuthView>('registration');

  const showRegistration = () => setCurrentView('registration');
  const showLogin = () => setCurrentView('login');
  const showForgotPassword = () => setCurrentView('forgot-password');

  return (
    <div className="w-full transition-opacity duration-300">
      {currentView === 'registration' && (
        <RegistrationForm 
          onShowLogin={showLogin}
        />
      )}
      
      {currentView === 'login' && (
        <>
          <FloatingElements />
          <LoginForm 
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
