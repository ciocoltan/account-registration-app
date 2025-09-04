import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ResidenceAddress() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    residenceCountry: 'Israel',
    notUsCitizen: false,
    agreedToTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.agreedToTerms) newErrors['agreedToTerms'] = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      navigate('/en/apply/public-official-status');
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center text-gray-800">Residence Address</h2>
      <p className="text-center text-gray-500 pb-4">
        Must match address on accepted{' '}
        <a href="#" className="text-blue-600 font-medium">proof of address document</a>
      </p>
      
      <div>
        <label htmlFor="residence-country" className="text-sm font-medium text-gray-700">Residence country</label>
        <select
          id="residence-country"
          name="residenceCountry"
          value={formData.residenceCountry}
          onChange={(e) => handleInputChange('residenceCountry', e.target.value)}
          className="form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm"
          style={{ backgroundColor: 'rgb(248, 249, 250)' }}
        >
          <option>Israel</option>
          <option>United States</option>
        </select>
      </div>
      
      <div className="pt-2 space-y-3">
        <div className="flex items-center">
          <input
            id="not-us-citizen"
            name="notUsCitizen"
            type="checkbox"
            checked={formData.notUsCitizen}
            onChange={(e) => handleInputChange('notUsCitizen', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="not-us-citizen" className="ml-2 block text-sm text-gray-900">
            I am not a citizen or resident of the United States of America for tax purposes.
          </label>
        </div>
        
        <div>
          <div className="flex items-center">
            <input
              id="terms-conditions"
              name="agreedToTerms"
              type="checkbox"
              checked={formData.agreedToTerms}
              onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms-conditions" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Terms & Conditions</a>
            </label>
          </div>
          {errors.agreedToTerms && (
            <p className="text-red-500 text-sm mt-1 ml-6">{errors.agreedToTerms}</p>
          )}
        </div>
      </div>
      
      <div className="pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ResidenceAddress;
