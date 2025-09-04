import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '~backend/client';
import type { Country } from '~backend/auth/countries';
import Spinner from '../Spinner';

interface FormData {
  [key: string]: string | boolean;
}

function PersonalDetails() {
  const navigate = useNavigate();
  const [localData, setLocalData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [phoneCodes, setPhoneCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await backend.auth.getCountries();
        setCountries(response.countries);
        
        const uniquePhoneCodes = [...new Set(response.countries.map(c => c.tel_country_code).filter(Boolean))];
        setPhoneCodes(uniquePhoneCodes.sort());

        // Set default nationality and phone code if not already set
        if (response.countries.length > 0) {
          setLocalData(prev => ({
            ...prev,
            nationality: prev.nationality || response.countries[0].country_id.toString(),
            'phone-code': prev['phone-code'] || response.countries[0].tel_country_code,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        // Handle error, maybe show a toast message
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleInputChange = (name: string, value: string | boolean) => {
    const newData = { ...localData, [name]: value };
    setLocalData(newData);
    
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
    if (!localData['first-name']) newErrors['first-name'] = 'First name is required';
    if (!localData['last-name']) newErrors['last-name'] = 'Last name is required';
    if (!localData['phone']) newErrors['phone'] = 'Phone number is required';
    if (!localData['dob-day'] || !localData['dob-month'] || !localData['dob-year']) {
      newErrors['dob'] = 'Date of birth is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const user = localStorage.getItem('user');
      const access_token = localStorage.getItem('access_token');

      if (!user || !access_token) {
        throw new Error("User not authenticated");
      }

      const day = String(localData['dob-day']).padStart(2, '0');
      const month = String(localData['dob-month']).padStart(2, '0');
      const birth_dt = `${localData['dob-year']}/${day}/${month}`;

      await backend.onboarding.setUserData({
        user,
        access_token,
        fname: localData['first-name'] as string,
        lname: localData['last-name'] as string,
        tel1: localData['phone'] as string,
        tel1_country_code: localData['phone-code'] as string,
        cou_id: localData.nationality as string,
        birth_dt,
      });

      navigate('/en/apply/residence-address');
    } catch (error: any) {
      console.error("Failed to save user data:", error);
      setErrors(prev => ({ ...prev, general: error.message || "Failed to save data" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - 18) - i);

  if (isLoading) {
    return <Spinner />;
  }

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
          <option>Ms/Mrs/Miss</option>
          <option>Other</option>
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
            className={`form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm ${errors['first-name'] ? 'border-red-500' : ''}`}
            style={{ backgroundColor: 'rgb(248, 249, 250)' }}
            placeholder="First name"
          />
          {errors['first-name'] && <p className="text-red-500 text-sm mt-1">{errors['first-name']}</p>}
        </div>
        <div>
          <label htmlFor="last-name" className="text-sm font-medium text-gray-700">Last name</label>
          <input
            type="text"
            name="last-name"
            id="last-name"
            value={localData['last-name'] as string || ''}
            onChange={(e) => handleInputChange('last-name', e.target.value)}
            className={`form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm ${errors['last-name'] ? 'border-red-500' : ''}`}
            style={{ backgroundColor: 'rgb(248, 249, 250)' }}
            placeholder="Last name"
          />
          {errors['last-name'] && <p className="text-red-500 text-sm mt-1">{errors['last-name']}</p>}
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700">Date of birth</label>
        <div className="grid grid-cols-3 gap-4 mt-1">
          <select id="dob-day" name="dob-day" value={localData['dob-day'] as string || ''} onChange={(e) => handleInputChange('dob-day', e.target.value)} className="form-input custom-bg-input block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
            <option value="">Day</option>
            {days.map(day => <option key={day} value={day}>{day}</option>)}
          </select>
          <select id="dob-month" name="dob-month" value={localData['dob-month'] as string || ''} onChange={(e) => handleInputChange('dob-month', e.target.value)} className="form-input custom-bg-input block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
            <option value="">Month</option>
            {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
          </select>
          <select id="dob-year" name="dob-year" value={localData['dob-year'] as string || ''} onChange={(e) => handleInputChange('dob-year', e.target.value)} className="form-input custom-bg-input block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
            <option value="">Year</option>
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
      </div>
      
      <div>
        <label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nationality</label>
        <select id="nationality" name="nationality" value={localData.nationality as string || ''} onChange={(e) => handleInputChange('nationality', e.target.value)} className="form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
          <option value="">Select Nationality</option>
          {countries.map(country => <option key={country.country_id} value={country.country_id}>{country.name}</option>)}
        </select>
      </div>
      
      <div>
        <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
        <div className="flex mt-1">
          <select id="phone-code" name="phone-code" value={localData['phone-code'] as string || ''} onChange={(e) => handleInputChange('phone-code', e.target.value)} className="form-input custom-bg-input block border rounded-l-lg py-2 px-3 focus:outline-none sm:text-sm w-1/3" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
            <option value="">Code</option>
            {phoneCodes.map(code => <option key={code} value={code}>+{code}</option>)}
          </select>
          <input type="tel" name="phone" id="phone" value={localData.phone as string || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className={`form-input custom-bg-input block w-full border rounded-r-lg py-2 px-3 focus:outline-none sm:text-sm ${errors.phone ? 'border-red-500' : ''}`} style={{ backgroundColor: 'rgb(248, 249, 250)' }} placeholder="Phone" />
        </div>
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>
      
      <div className="pt-4">
        <button type="button" onClick={handleNext} disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? <Spinner /> : 'Next'}
        </button>
        {errors.general && <p className="text-red-500 text-center mt-2">{errors.general}</p>}
      </div>
    </div>
  );
}

export default PersonalDetails;
