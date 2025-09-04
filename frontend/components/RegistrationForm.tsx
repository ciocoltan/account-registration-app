import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import PasswordInput from './PasswordInput';
import { useAuth } from '../contexts/AuthContext';

interface RegistrationFormProps {
  onShowLogin: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  privacy?: string;
  general?: string;
}

function RegistrationForm({ onShowLogin }: RegistrationFormProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    privacyPolicy: false,
    marketingComms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState<string>('US');

  const features = [
    'Scope Invest account',
    'Competitive trading conditions',
    'Award-winning broker',
    'Advanced trading platforms',
    'Fast and convenient transactions',
    'Excellent multilingual customer support',
    'Authorized and regulated by the FSC',
  ];

  useEffect(() => {
    // Get country code from Cloudflare trace
    const getCountryFromCloudflare = async () => {
      try {
        const response = await fetch('https://cloudflare.com/cdn-cgi/trace');
        const text = await response.text();
        
        // Parse the trace response
        const lines = text.split('\n');
        const locLine = lines.find(line => line.startsWith('loc='));
        
        if (locLine) {
          const country = locLine.split('=')[1];
          console.log('Detected country from Cloudflare:', country);
          setCountryCode(country);
        }
      } catch (error) {
        console.error('Failed to get country from Cloudflare:', error);
        // Keep default 'US' if detection fails
      }
    };

    getCountryFromCloudflare();
  }, []);

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'email') clearError('email');
    if (field === 'password') clearError('password');
    if (field === 'privacyPolicy') clearError('privacy');
    clearError('general');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) newErrors.email = 'E-mail is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.privacyPolicy) newErrors.privacy = 'Agreeing to the Privacy Policy is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await register(formData.email, formData.password, 'USD', countryCode);
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      const errorMessage = error?.message || 'Registration failed.';
      
      if (errorMessage.toLowerCase().includes('already exists')) {
        onShowLogin();
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-16">
      <div className="hidden md:block">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">Why trade with Scope Markets:</h2>
        <p className="text-gray-600 mb-8">Here is why thousands of customers choose to trade with Scope Markets:</p>
        <ul className="space-y-5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="h-6 w-6 text-blue-500 mr-3" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-white p-12 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Open an account</h2>
          <p className="text-gray-500 mt-2">
            Already have an account?{' '}
            <button 
              onClick={onShowLogin}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Login here
            </button>
          </p>
          {countryCode !== 'US' && (
            <p className="text-xs text-gray-400 mt-1">
              Detected location: {countryCode}
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`form-input custom-bg-input block w-full border rounded-lg py-3 px-4 focus:outline-none sm:text-sm ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ backgroundColor: 'rgb(248, 249, 250)' }}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              error={errors.password}
            />
          </div>
          
          <div className="pt-2">
            <div className="flex items-center">
              <input
                id="privacy-policy"
                type="checkbox"
                checked={formData.privacyPolicy}
                onChange={(e) => handleInputChange('privacyPolicy', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="privacy-policy" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Privacy Policy.
                </a>
              </label>
            </div>
            {errors.privacy && (
              <p className="text-red-500 text-sm mt-1">{errors.privacy}</p>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              id="marketing-comms"
              type="checkbox"
              checked={formData.marketingComms}
              onChange={(e) => handleInputChange('marketingComms', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="marketing-comms" className="ml-2 block text-sm text-gray-900">
              I agree to receive marketing and promotional communications
            </label>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
            {errors.general && (
              <p className="text-red-500 text-center mt-4">{errors.general}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;
