import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FormDataProvider } from './contexts/FormDataContext';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import FloatingElements from './components/FloatingElements';
import MultiStepContainer from './components/MultiStepContainer';
import PersonalDetails from './components/steps/PersonalDetails';
import ResidenceAddress from './components/steps/ResidenceAddress';
import PublicOfficialStatus from './components/steps/PublicOfficialStatus';
import EmploymentStatus from './components/steps/EmploymentStatus';
import Industry from './components/steps/Industry';
import AnnualIncome from './components/steps/AnnualIncome';
import AvailableToInvest from './components/steps/AvailableToInvest';
import PlanToInvest from './components/steps/PlanToInvest';
import InvestmentSource from './components/steps/InvestmentSource';
import ProfessionalExperience from './components/steps/ProfessionalExperience';
import RiskTolerance from './components/steps/RiskTolerance';
import TradingObjective from './components/steps/TradingObjective';
import VerificationStep from './components/steps/VerificationStep';
import Spinner from './components/Spinner';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-white flex flex-col items-center justify-center min-h-screen">
        <Spinner />
        <p className="text-gray-600 mt-4">Checking your session...</p>
      </div>
    );
  }

  return (
    <div className="bg-white flex items-center justify-center min-h-screen p-4 overflow-hidden">
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/en/apply" element={<MultiStepContainer />}>
              <Route index element={<Navigate to="personal-details" replace />} />
              <Route path="personal-details" element={<PersonalDetails />} />
              <Route path="residence-address" element={<ResidenceAddress />} />
              <Route path="public-official-status" element={<PublicOfficialStatus />} />
              <Route path="employment-status" element={<EmploymentStatus />} />
              <Route path="industry" element={<Industry />} />
              <Route path="annual-income" element={<AnnualIncome />} />
              <Route path="available-to-invest" element={<AvailableToInvest />} />
              <Route path="plan-to-invest" element={<PlanToInvest />} />
              <Route path="investment-source" element={<InvestmentSource />} />
              <Route path="professional-experience" element={<ProfessionalExperience />} />
              <Route path="risk-tolerance" element={<RiskTolerance />} />
              <Route path="trading-objective" element={<TradingObjective />} />
              <Route path="verification" element={<VerificationStep />} />
            </Route>
            <Route path="*" element={<Navigate to="/en/apply" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<><FloatingElements /><LoginForm /></>} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/forgot-password" element={<><FloatingElements /><ForgotPasswordForm /></>} />
            <Route path="*" element={<Navigate to="/register" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

function AppWrapper() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <FormDataProvider>
      <AppRoutes />
    </FormDataProvider>
  ) : (
    <AppRoutes />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
