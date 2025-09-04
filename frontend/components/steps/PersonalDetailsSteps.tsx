import React, { useState, useEffect } from 'react';
import { FormData } from '../MultiStepContainer';

interface PersonalDetailsStepsProps {
  stepId: string;
  formData: FormData;
  onSaveData: (data: FormData) => void;
  onNext: () => void;
}

function PersonalDetailsSteps({ stepId, formData, onSaveData, onNext }: PersonalDetailsStepsProps) {
  const [localData, setLocalData] = useState<FormData>(formData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  const handleInputChange = (name: string, value: string | boolean) => {
    const newData = { ...localData, [name]: value };
    setLocalData(newData);
    onSaveData(newData);
    
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
    
    if (stepId === '1-0') {
      if (!localData['first-name']) newErrors['first-name'] = 'First name is required';
      if (!localData['last-name']) newErrors['last-name'] = 'Last name is required';
      if (!localData['phone']) newErrors['phone'] = 'Phone number is required';
    } else if (stepId === '1-1') {
      if (!localData['agreedToTerms']) newErrors['agreedToTerms'] = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  // Generate day options
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  if (stepId === '1-0') {
    return (
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-center text-gray-800">Personal Details</h2>
        <p className="text-center text-gray-500 pb-4">Must match details on your ID / passport</p>
        
        <div>
          <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
          <select
            id="title"
            name="title"
            value={localData.title as string || 'Mr'}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm"
            style={{ backgroundColor: 'rgb(248, 249, 250)' }}
          >
            <option>Mr</option>
            <option>Mrs</option>
            <option>Ms</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first-name" className="text-sm font-medium text-gray-700">First name</label>
            <input
              type="text"
              name="first-name"
              id="first-name"
              value={localData['first-name'] as string || ''}
              onChange={(e) => handleInputChange('first-name', e.target.value)}
              className={`form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm ${
                errors['first-name'] ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: 'rgb(248, 249, 250)' }}
              placeholder="First name"
            />
            {errors['first-name'] && (
              <p className="text-red-500 text-sm mt-1">{errors['first-name']}</p>
            )}
          </div>
          <div>
            <label htmlFor="last-name" className="text-sm font-medium text-gray-700">Last name</label>
            <input
              type="text"
              name="last-name"
              id="last-name"
              value={localData['last-name'] as string || ''}
              onChange={(e) => handleInputChange('last-name', e.target.value)}
              className={`form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm ${
                errors['last-name'] ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: 'rgb(248, 249, 250)' }}
              placeholder="Last name"
            />
            {errors['last-name'] && (
              <p className="text-red-500 text-sm mt-1">{errors['last-name']}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Date of birth</label>
          <div className="grid grid-cols-3 gap-4 mt-1">
            <select
              id="dob-day"
              name="dob-day"
              value={localData['dob-day'] as string || ''}
              onChange={(e) => handleInputChange('dob-day', e.target.value)}
              className="form-input custom-bg-input block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm"
              style={{ backgroundColor: 'rgb(248, 249, 250)' }}
            >
              <option value="">Day</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              id="dob-month"
              name="dob-month"
              value={localData['dob-month'] as string || ''}
              onChange={(e) => handleInputChange('dob-month', e.target.value)}
              className="form-input custom-bg-input block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm"
              style={{ backgroundColor: 'rgb(248, 249, 250)' }}
            >
              <option value="">Month</option>
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              id="dob-year"
              name="dob-year"
              value={localData['dob-year'] as string || ''}
              onChange={(e) => handleInputChange('dob-year', e.target.value)}
              className="form-input custom-bg-input block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm"
              style={{ backgroundColor: 'rgb(248, 249, 250)' }}
            >
              <option value="">Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nationality</label>
          <select
            id="nationality"
            name="nationality"
            value={localData.nationality as string || '479'}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            className="form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm"
            style={{ backgroundColor: 'rgb(248, 249, 250)' }}
          >
            <option value="479">Moldova</option>
            <option value="840">United States</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
          <div className="flex mt-1">
            <select
              id="phone-code"
              name="phone-code"
              value={localData['phone-code'] as string || '+373'}
              onChange={(e) => handleInputChange('phone-code', e.target.value)}
              className="form-input custom-bg-input block border rounded-l-lg py-2 px-3 focus:outline-none sm:text-sm"
              style={{ backgroundColor: 'rgb(248, 249, 250)' }}
            >
              <option>+373</option>
              <option>+1</option>
            </select>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={localData.phone as string || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`form-input custom-bg-input block w-full border rounded-r-lg py-2 px-3 focus:outline-none sm:text-sm ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: 'rgb(248, 249, 250)' }}
              placeholder="Phone"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
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

  if (stepId === '1-1') {
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
            value={localData.residenceCountry as string || 'Israel'}
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
              checked={localData.notUsCitizen as boolean || false}
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
                checked={localData.agreedToTerms as boolean || false}
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

  if (stepId === '1-2') {
    return (
      <div>
        <h2 className="text-lg font-semibold text-center text-gray-800 leading-tight">
          Are you or any close family members or associates a person who holds, or has held, a public position or prominent public function in any of the following:
        </h2>
        
        <div className="space-y-4 pt-6">
          <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer">
            <input
              type="radio"
              name="publicOfficialStatus"
              value="Foreign Public Officials"
              checked={localData.publicOfficialStatus === 'Foreign Public Officials'}
              onChange={(e) => handleInputChange('publicOfficialStatus', e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 text-sm">
              <span className="font-medium text-gray-900 block">Foreign Public Officials</span>
              <span className="text-gray-500">(Top officials in foreign governments or public roles outside Belize)</span>
            </span>
          </label>
          
          <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer">
            <input
              type="radio"
              name="publicOfficialStatus"
              value="Domestic Public Officials"
              checked={localData.publicOfficialStatus === 'Domestic Public Officials'}
              onChange={(e) => handleInputChange('publicOfficialStatus', e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 text-sm">
              <span className="font-medium text-gray-900 block">Domestic Public Officials</span>
              <span className="text-gray-500">(Top officials in Belizean government, law enforcement, or judiciary)</span>
            </span>
          </label>
          
          <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer">
            <input
              type="radio"
              name="publicOfficialStatus"
              value="International Organisation Leaders"
              checked={localData.publicOfficialStatus === 'International Organisation Leaders'}
              onChange={(e) => handleInputChange('publicOfficialStatus', e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 text-sm">
              <span className="font-medium text-gray-900 block">International Organisation Leaders</span>
              <span className="text-gray-500">(Senior leaders in International bodies or global agencies)</span>
            </span>
          </label>
          
          <div className="text-center text-gray-500 font-medium">Or</div>
          
          <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer">
            <input
              type="radio"
              name="publicOfficialStatus"
              value="None of the above"
              checked={localData.publicOfficialStatus === 'None of the above' || !localData.publicOfficialStatus}
              onChange={(e) => handleInputChange('publicOfficialStatus', e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 font-medium text-gray-900">None of the above</span>
          </label>
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

  return null;
}

export default PersonalDetailsSteps;
