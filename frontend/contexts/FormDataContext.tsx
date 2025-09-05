import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface FormData {
  // Step 1 - Personal Details
  title?: string;
  'first-name'?: string;
  'last-name'?: string;
  'dob-day'?: string;
  'dob-month'?: string;
  'dob-year'?: string;
  nationality?: string;
  'phone-code'?: string;
  phone?: string;
  
  // Step 2 - Residence Address
  residenceCountry?: string;
  notUsCitizen?: boolean;
  agreedToTerms?: boolean;
  
  // Step 3 - Public Official Status
  publicOfficialStatus?: string;
  
  // Step 4 - Employment Status
  employmentStatus?: string;
  
  // Step 5 - Industry
  industry?: string;
  
  // Step 6 - Annual Income
  annualIncome?: string;
  
  // Step 7 - Available to Invest
  availableToInvest?: string;
  
  // Step 8 - Plan to Invest
  planToInvest?: string;
  
  // Step 9 - Investment Source
  investmentSource?: string;
  
  // Step 10 - Professional Experience
  professionalExperience?: string;
  
  // Step 11 - Risk Tolerance
  riskTolerance?: string;
  
  // Step 12 - Trading Objective
  tradingObjective?: string;
  
  // Metadata
  currentStep?: string;
  lastUpdated?: string;
}

interface FormDataContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  clearFormData: () => void;
  saveToStorage: () => void;
  isLoading: boolean;
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

interface FormDataProviderProps {
  children: ReactNode;
}

export function FormDataProvider({ children }: FormDataProviderProps) {
  const { authData, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Generate storage key based on user ID
  const getStorageKey = () => {
    if (!authData?.user) return null;
    return `form_data_${authData.user}`;
  };

  // Load data from localStorage when user authenticates
  useEffect(() => {
    if (isAuthenticated && authData?.user) {
      const storageKey = getStorageKey();
      if (storageKey) {
        try {
          const savedData = localStorage.getItem(storageKey);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            console.log('Loaded form data from localStorage:', parsedData);
            setFormData(parsedData);
          } else {
            console.log('No saved form data found');
          }
        } catch (error) {
          console.error('Failed to load form data from localStorage:', error);
          // Clear corrupted data
          if (storageKey) {
            localStorage.removeItem(storageKey);
          }
        }
      }
      setIsLoading(false);
    } else {
      // Clear form data when not authenticated
      setFormData({});
      setIsLoading(false);
    }
  }, [isAuthenticated, authData]);

  // Save data to localStorage
  const saveToStorage = () => {
    const storageKey = getStorageKey();
    if (storageKey && Object.keys(formData).length > 0) {
      try {
        const dataToSave = {
          ...formData,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        console.log('Form data saved to localStorage:', dataToSave);
      } catch (error) {
        console.error('Failed to save form data to localStorage:', error);
      }
    }
  };

  // Update form data and save to storage
  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...data };
      // Auto-save after updating
      setTimeout(() => {
        const storageKey = getStorageKey();
        if (storageKey) {
          try {
            const dataToSave = {
              ...newData,
              lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify(dataToSave));
            console.log('Form data auto-saved to localStorage:', dataToSave);
          } catch (error) {
            console.error('Failed to auto-save form data:', error);
          }
        }
      }, 100);
      
      return newData;
    });
  };

  // Clear form data from state and localStorage
  const clearFormData = () => {
    const storageKey = getStorageKey();
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
        console.log('Form data cleared from localStorage');
      } catch (error) {
        console.error('Failed to clear form data from localStorage:', error);
      }
    }
    setFormData({});
  };

  // Auto-save when formData changes
  useEffect(() => {
    if (isAuthenticated && authData?.user && Object.keys(formData).length > 0) {
      saveToStorage();
    }
  }, [formData, isAuthenticated, authData]);

  return (
    <FormDataContext.Provider value={{
      formData,
      updateFormData,
      clearFormData,
      saveToStorage,
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
