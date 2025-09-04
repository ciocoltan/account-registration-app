import React, { useState } from 'react';
import PasswordInput from './PasswordInput';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onShowRegister: () => void;
  onShowForgotPassword: () => void;
}

interface FormErrors {
  email?: string;
  general?: string;
}

function LoginForm({ onShowRegister, onShowForgotPassword }: LoginFormProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error?.message || 'Invalid email or password.';
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-12 rounded-xl shadow-lg relative z-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Login</h2>
        <p className="text-gray-500 mt-2">
          Don't have an account?{' '}
          <button 
            onClick={onShowRegister}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register here
          </button>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <div className="relative">
            <input
              id="login-email"
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
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <PasswordInput
            id="login-password"
            value={formData.password}
            onChange={(value) => handleInputChange('password', value)}
          />
        </div>
        
        <div className="text-center">
          <button
            type="button"
            onClick={onShowForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Forgot your password?
          </button>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
          {errors.general && (
            <p className="text-red-500 text-center mt-4">{errors.general}</p>
          )}
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
