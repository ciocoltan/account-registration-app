import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '~backend/client';

interface FormErrors {
  email?: string;
  general?: string;
}

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'email') clearError('email');
    clearError('general');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await backend.auth.forgotPassword({
        email: formData.email
      });

      if (response.success) {
        setIsSuccess(true);
      }
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      const errorMessage = error?.message || 'Failed to send password reset email. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white p-12 rounded-xl shadow-lg relative z-10">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-8">
            We've sent a password reset link to <strong>{formData.email}</strong>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Login
            </button>
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-12 rounded-xl shadow-lg relative z-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Reset your password</h2>
        <p className="text-gray-500 mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <div className="relative">
            <input
              id="forgot-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`form-input custom-bg-input block w-full border rounded-lg py-3 px-4 focus:outline-none sm:text-sm ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: 'rgb(248, 249, 250)' }}
              placeholder="Enter your email address"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
          {errors.general && (
            <p className="text-red-500 text-center mt-4">{errors.general}</p>
          )}
        </div>
        
        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Back to Login
          </button>
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/register')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Register here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default ForgotPasswordForm;
