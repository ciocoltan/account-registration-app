import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import backend from '~backend/client';

interface FormData {
  // All form data fields from the PRD
  title?: string;
  'first-name'?: string;
  'last-name'?: string;
  'dob-day'?: string;
  'dob-month'?: string;
  'dob-year'?: string;
  nationality?: string;
  'phone-code'?: string;
  phone?: string;
  residenceCountry?: string;
  notUsCitizen?: boolean;
  agreedToTerms?: boolean;
  publicOfficialStatus?: string;
  employmentStatus?: string;
  industry?: string;
  annualIncome?: string;
  availableToInvest?: string;
  planToInvest?: string;
  investmentSource?: string;
  professionalExperience?: string;
  riskTolerance?: string;
  tradingObjective?: string;
  // Metadata
  currentStep?: string;
  lastUpdated?: string;
}

interface FormDataContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => Promise<void>;
  clearFormData: () => Promise<void>;
  isLoading: boolean;
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

export function FormDataProvider({ children }: { children: ReactNode }) {
  const { authData, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Simulate CRM backend calls for saving and loading data
  useEffect(() => {
    const fetchFormData = async () => {
      if (!isAuthenticated || !authData?.uid) {
        setIsLoading(false);
        setFormData({});
        return;
      }
      try {
        console.log('Fetching form data from CRM backend...');
        // Simulate a call to a backend endpoint that retrieves user data from the CRM
        // const response = await backend.crm.getFormData({ userId: authData.uid }); // This endpoint is a placeholder.
        // setFormData(response.data || {});
        // Mock data for now since we don't have the backend implemented
        setFormData({});
      } catch (error) {
        console.error("Failed to fetch data from CRM:", error);
        setFormData({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchFormData();
  }, [isAuthenticated, authData?.uid]);

  const updateFormData = async (data: Partial<FormData>) => {
    if (!isAuthenticated || !authData?.uid) return;
    
    const newData = { ...formData, ...data, lastUpdated: new Date().toISOString() };
    
    try {
      console.log('Updating form data in CRM backend:', newData);
      // Simulate a call to a backend endpoint that updates user data in the CRM
      // await backend.crm.updateFormData({ userId: authData.uid, data: newData }); // This endpoint is a placeholder.
      // For this example, we will just update the state directly
      setFormData(newData);
    } catch (error) {
      console.error('Failed to save data to CRM:', error);
    }
  };

  const clearFormData = async () => {
    if (!isAuthenticated || !authData?.uid) return;
    try {
      console.log('Clearing form data in CRM backend for user:', authData.uid);
      // Simulate a call to a backend endpoint that clears user data in the CRM
      // await backend.crm.clearFormData({ userId: authData.uid }); // This endpoint is a placeholder.
      setFormData({});
    } catch (error) {
      console.error('Failed to clear data from CRM:', error);
    }
  };

  return (
    <FormDataContext.Provider value={{
      formData,
      updateFormData,
      clearFormData,
      isLoading
    }}>
      {children}
    </FormDataContext.Provider>
  );
}

export function useFormData() {
  const context = useContext(FormDataContext);
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }
  return context;
}
