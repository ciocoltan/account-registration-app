import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFormData } from '../../contexts/FormDataContext';
import type { Country } from '~backend/auth/countries';
import Spinner from '../Spinner';
import backend from '~backend/client';
import { useBackend } from '../../hooks/useBackend';

const defaultCountries: Country[] = [
  { country_id: 1, name: 'Afghanistan', iso_alpha2_code: 'AF', iso_alpha3_code: 'AFG', tel_country_code: '93', show_on_register: 1, currency: 'USD', currency_id: 1, brand_id: 1, zone: 'Asia' },
  { country_id: 2, name: 'United Kingdom', iso_alpha2_code: 'GB', iso_alpha3_code: 'GBR', tel_country_code: '44', show_on_register: 1, currency: 'GBP', currency_id: 2, brand_id: 1, zone: 'Europe' },
  { country_id: 3, name: 'Canada', iso_alpha2_code: 'CA', iso_alpha3_code: 'CAN', tel_country_code: '1', show_on_register: 1, currency: 'CAD', currency_id: 3, brand_id: 1, zone: 'America' },
  { country_id: 4, name: 'Australia', iso_alpha2_code: 'AU', iso_alpha3_code: 'AUS', tel_country_code: '61', show_on_register: 1, currency: 'AUD', currency_id: 4, brand_id: 1, zone: 'Oceania' },
  { country_id: 5, name: 'Germany', iso_alpha2_code: 'DE', iso_alpha3_code: 'DEU', tel_country_code: '49', show_on_register: 1, currency: 'EUR', currency_id: 5, brand_id: 1, zone: 'Europe' },
  { country_id: 6, name: 'France', iso_alpha2_code: 'FR', iso_alpha3_code: 'FRA', tel_country_code: '33', show_on_register: 1, currency: 'EUR', currency_id: 5, brand_id: 1, zone: 'Europe' },
  { country_id: 7, name: 'Italy', iso_alpha2_code: 'IT', iso_alpha3_code: 'ITA', tel_country_code: '39', show_on_register: 1, currency: 'EUR', currency_id: 5, brand_id: 1, zone: 'Europe' },
  { country_id: 8, name: 'Spain', iso_alpha2_code: 'ES', iso_alpha3_code: 'ESP', tel_country_code: '34', show_on_register: 1, currency: 'EUR', currency_id: 5, brand_id: 1, zone: 'Europe' },
  { country_id: 9, name: 'Japan', iso_alpha2_code: 'JP', iso_alpha3_code: 'JPN', tel_country_code: '81', show_on_register: 1, currency: 'JPY', currency_id: 6, brand_id: 1, zone: 'Asia' },
  { country_id: 10, name: 'South Korea', iso_alpha2_code: 'KR', iso_alpha3_code: 'KOR', tel_country_code: '82', show_on_register: 1, currency: 'KRW', currency_id: 7, brand_id: 1, zone: 'Asia' },
  { country_id: 11, name: 'China', iso_alpha2_code: 'CN', iso_alpha3_code: 'CHN', tel_country_code: '86', show_on_register: 1, currency: 'CNY', currency_id: 8, brand_id: 1, zone: 'Asia' },
  { country_id: 12, name: 'India', iso_alpha2_code: 'IN', iso_alpha3_code: 'IND', tel_country_code: '91', show_on_register: 1, currency: 'INR', currency_id: 9, brand_id: 1, zone: 'Asia' },
  { country_id: 13, name: 'Brazil', iso_alpha2_code: 'BR', iso_alpha3_code: 'BRA', tel_country_code: '55', show_on_register: 1, currency: 'BRL', currency_id: 10, brand_id: 1, zone: 'America' },
  { country_id: 14, name: 'Mexico', iso_alpha2_code: 'MX', iso_alpha3_code: 'MEX', tel_country_code: '52', show_on_register: 1, currency: 'MXN', currency_id: 11, brand_id: 1, zone: 'America' },
  { country_id: 15, name: 'Argentina', iso_alpha2_code: 'AR', iso_alpha3_code: 'ARG', tel_country_code: '54', show_on_register: 1, currency: 'ARS', currency_id: 12, brand_id: 1, zone: 'America' },
  { country_id: 16, name: 'South Africa', iso_alpha2_code: 'ZA', iso_alpha3_code: 'ZAF', tel_country_code: '27', show_on_register: 1, currency: 'ZAR', currency_id: 13, brand_id: 1, zone: 'Africa' },
  { country_id: 17, name: 'Nigeria', iso_alpha2_code: 'NG', iso_alpha3_code: 'NGA', tel_country_code: '234', show_on_register: 1, currency: 'NGN', currency_id: 14, brand_id: 1, zone: 'Africa' },
  { country_id: 18, name: 'Egypt', iso_alpha2_code: 'EG', iso_alpha3_code: 'EGY', tel_country_code: '20', show_on_register: 1, currency: 'EGP', currency_id: 15, brand_id: 1, zone: 'Africa' },
  { country_id: 19, name: 'Israel', iso_alpha2_code: 'IL', iso_alpha3_code: 'ISR', tel_country_code: '972', show_on_register: 1, currency: 'ILS', currency_id: 16, brand_id: 1, zone: 'Asia' },
  { country_id: 20, name: 'Turkey', iso_alpha2_code: 'TR', iso_alpha3_code: 'TUR', tel_country_code: '90', show_on_register: 1, currency: 'TRY', currency_id: 17, brand_id: 1, zone: 'Asia' }
];

const defaultPhoneCodes = ['93', '20', '27', '33', '34', '39', '44', '49', '52', '54', '55', '61', '81', '82', '86', '90', '91', '234', '972'];

function PersonalDetails() {
  const navigate = useNavigate();
  const { authData, isAuthenticated } = useAuth();
  const { formData, updateFormData } = useFormData();
  const backend = useBackend();
  
  const [localFormData, setLocalFormData] = useState({
    title: formData.title || 'Mr',
    'first-name': formData['first-name'] || '',
    'last-name': formData['last-name'] || '',
    'dob-day': formData['dob-day'] || '',
    'dob-month': formData['dob-month'] || '',
    'dob-year': formData['dob-year'] || '',
    nationality: formData.nationality || '',
    'phone-code': formData['phone-code'] || '',
    phone: formData.phone || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<Country[]>(defaultCountries);
  const [phoneCodes, setPhoneCodes] = useState<string[]>(defaultPhoneCodes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  // Load countries from cache or fetch from API
  const loadCountries = async () => {
    try {
      // First, try to load from localStorage cache
      const cachedCountries = localStorage.getItem('registration_country');
      if (cachedCountries) {
        const { data, timestamp } = JSON.parse(cachedCountries);
        // Check if cache is less than 24 hours old
        const cacheAge = Date.now() - timestamp;
        const oneDayInMs = 24 * 60 * 60 * 1000;
        const oneMonthInMs = 30 * oneDayInMs;
				
        if (cacheAge < oneMonthInMs) {
          console.log('Loading countries from cache');
          setCountries(data);
          
          const uniquePhoneCodes = [...new Set(data.map((c: Country) => c.tel_country_code).filter(Boolean))];
          setPhoneCodes(uniquePhoneCodes.sort());
          return data;
        } else {
          console.log('Countries cache expired, fetching fresh data');
          localStorage.removeItem('registration_country');
        }
      }

      // If no cache or cache expired, fetch from API
      console.log('Fetching countries from API');
      setIsLoadingCountries(true);
      
      const response = await backend.auth.getCountries({});
      const fetchedCountries = response.countries;
      
      // Cache the countries data
      try {
        localStorage.setItem('registration_country', JSON.stringify({
          data: fetchedCountries,
          timestamp: Date.now()
        }));
        console.log('Countries cached to localStorage');
      } catch (cacheError) {
        console.error('Failed to cache countries:', cacheError);
      }

      setCountries(fetchedCountries);
      
      const uniquePhoneCodes = [...new Set(fetchedCountries.map(c => c.tel_country_code).filter(Boolean))];
      setPhoneCodes(uniquePhoneCodes.sort());
      
      return fetchedCountries;
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      // Keep default countries if API fails
      return defaultCountries;
    } finally {
      setIsLoadingCountries(false);
    }
  };

  // Auto-fill nationality based on registration country
  const autoFillFromRegistration = async (availableCountries: Country[]) => {
    try {
      const registrationData = localStorage.getItem('registration_country');
      if (registrationData && !formData.nationality) {
        const parsed = JSON.parse(registrationData);

      // Ensure parsed has data array
      if (!parsed?.data || !Array.isArray(parsed.data)) {
        console.warn("Invalid registration_country format");
        return;
      }
				// Pick the first country from registration data (or whichever logic you want)

				// Step 1: Try to detect country code from Cloudflare
      let countryCode: string | null = null;
      try {
        const res = await fetch("https://cloudflare.com/cdn-cgi/trace");
        const text = await res.text();
        const locLine = text.split("\n").find(line => line.startsWith("loc="));
        if (locLine) {
          countryCode = locLine.split("=")[1].trim(); // e.g. "CY"
        }
    } catch (err) {
        console.warn("Cloudflare detection failed:", err);
      }
			
        console.log('Auto-filling nationality from registration country:', countryCode);
        
        // Find the country by ISO code
        const matchingCountry = availableCountries.find(c => 
          c.iso_alpha2_code === countryCode
        );
        
        if (matchingCountry) {
          console.log('Found matching country:', matchingCountry.name);
          setLocalFormData(prev => ({
            ...prev,
            nationality: matchingCountry.country_id.toString(),
            'phone-code': matchingCountry.tel_country_code
          }));
          
          // Update global form data as well
          updateFormData({
            nationality: matchingCountry.country_id.toString(),
            'phone-code': matchingCountry.tel_country_code
          });
        }
      }
    } catch (error) {
      console.error('Failed to auto-fill from registration data:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      // Load countries (from cache or API)
      const loadedCountries = await loadCountries();
      
      // Set defaults if not already set from saved form data
      if (!localFormData.nationality || !localFormData['phone-code']) {
        const defaultCountry = loadedCountries[0] || defaultCountries[0];
        setLocalFormData(prev => ({
          ...prev,
          nationality: prev.nationality || defaultCountry.country_id.toString(),
          'phone-code': prev['phone-code'] || defaultCountry.tel_country_code,
        }));
      }
      
      // Auto-fill from registration if form is empty
      autoFillFromRegistration(loadedCountries);
    };

    if (isAuthenticated) {
      initializeData();
    }
  }, [isAuthenticated]);

  const handleInputChange = (name: string, value: string) => {
    setLocalFormData(prev => ({ ...prev, [name]: value }));
    
    // Update global form data
    updateFormData({ [name]: value });
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextFieldId?: string) => {
    if (e.key === 'Enter' && nextFieldId) {
      e.preventDefault();
      const nextField = document.getElementById(nextFieldId);
      if (nextField) {
        nextField.focus();
      }
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!localFormData['first-name']) newErrors['first-name'] = 'First name is required';
    if (!localFormData['last-name']) newErrors['last-name'] = 'Last name is required';
    if (!localFormData['phone']) newErrors['phone'] = 'Phone number is required';
    if (!localFormData['dob-day'] || !localFormData['dob-month'] || !localFormData['dob-year']) {
      newErrors['dob'] = 'Date of birth is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      // Get nationality text from countries list
      const selectedCountry = countries.find(c => c.country_id.toString() === localFormData.nationality);
      const nationalityText = selectedCountry?.name || '';

      // Submit personal details to CRM
      if (authData?.user && authData?.accessToken) {
        await backend.crm.setPersonalDetails({
          user: authData.user,
          access_token: authData.accessToken,
          firstName: localFormData['first-name'],
          lastName: localFormData['last-name'],
          nationality: localFormData.nationality,
          nationalityText: nationalityText
        });
        
        console.log('Personal details submitted to CRM successfully');
      }
      
      // Save all form data to localStorage before navigating
      updateFormData(localFormData);
      
      console.log('Personal details submitted successfully, navigating to next step');
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

  return (
    <>
      {(isSubmitting || isLoadingCountries) && <Spinner overlay />}
      
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-center text-gray-800">Personal Details</h2>
        <p className="text-center text-gray-500 pb-4">Must match details on your ID / passport</p>
        
        <div>
          <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
          <select
            id="title"
            name="title"
            value={localFormData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'first-name')}
            className="form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm"
            style={{ backgroundColor: 'rgb(248, 249, 250)' }}
            disabled={isSubmitting}
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
              value={localFormData['first-name']}
              onChange={(e) => handleInputChange('first-name', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'last-name')}
              className={`form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm ${errors['first-name'] ? 'border-red-500' : ''}`}
              style={{ backgroundColor: 'rgb(248, 249, 750)' }}
              placeholder="First name"
              disabled={isSubmitting}
            />
            {errors['first-name'] && <p className="text-red-500 text-sm mt-1">{errors['first-name']}</p>}
          </div>
          <div>
            <label htmlFor="last-name" className="text-sm font-medium text-gray-700">Last name</label>
            <input
              type="text"
              name="last-name"
              id="last-name"
              value={localFormData['last-name']}
              onChange={(e) => handleInputChange('last-name', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'dob-day')}
              className={`form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm ${errors['last-name'] ? 'border-red-500' : ''}`}
              style={{ backgroundColor: 'rgb(248, 249, 250)' }}
              placeholder="Last name"
              disabled={isSubmitting}
            />
            {errors['last-name'] && <p className="text-red-500 text-sm mt-1">{errors['last-name']}</p>}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Date of birth</label>
          <div className="grid grid-cols-3 gap-4 mt-1">
            <select 
              id="dob-day" 
              name="dob-day" 
              value={localFormData['dob-day']} 
              onChange={(e) => handleInputChange('dob-day', e.target.value)} 
              onKeyDown={(e) => handleKeyDown(e, 'dob-month')}
              className="form-input custom-bg-input block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm" 
              style={{ backgroundColor: 'rgb(248, 249, 750)' }}
              disabled={isSubmitting}
            >
              <option value="">Day</option>
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
            <select 
              id="dob-month" 
              name="dob-month" 
              value={localFormData['dob-month']} 
              onChange={(e) => handleInputChange('dob-month', e.target.value)} 
              onKeyDown={(e) => handleKeyDown(e, 'dob-year')}
              className="form-input custom-bg-input block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm" 
              style={{ backgroundColor: 'rgb(248, 249, 750)' }}
              disabled={isSubmitting}
            >
              <option value="">Month</option>
              {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
            </select>
            <select 
              id="dob-year" 
              name="dob-year" 
              value={localFormData['dob-year']} 
              onChange={(e) => handleInputChange('dob-year', e.target.value)} 
              onKeyDown={(e) => handleKeyDown(e, 'nationality')}
              className="form-input custom-bg-input block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm" 
              style={{ backgroundColor: 'rgb(248, 249, 750)' }}
              disabled={isSubmitting}
            >
              <option value="">Year</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
        </div>
        
        <div>
          <label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nationality</label>
          <select 
            id="nationality" 
            name="nationality" 
            value={localFormData.nationality} 
            onChange={(e) => handleInputChange('nationality', e.target.value)} 
            onKeyDown={(e) => handleKeyDown(e, 'phone-code')}
            className="form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm" 
            style={{ backgroundColor: 'rgb(248, 249, 750)' }}
            disabled={isSubmitting}
          >
            <option value="">Select Nationality</option>
            {countries.map(country => <option key={country.country_id} value={country.country_id}>{country.name}</option>)}
          </select>
        </div>
        
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
          <div className="flex mt-1">
            <select 
              id="phone-code" 
              name="phone-code" 
              value={localFormData['phone-code']} 
              onChange={(e) => handleInputChange('phone-code', e.target.value)} 
              onKeyDown={(e) => handleKeyDown(e, 'phone')}
              className="form-input custom-bg-input block border rounded-l-lg py-2 px-3 focus:outline-none sm:text-sm w-1/3" 
              style={{ backgroundColor: 'rgb(248, 249, 750)' }}
              disabled={isSubmitting}
            >
              <option value="">Code</option>
              {phoneCodes.map(code => <option key={code} value={code}>+{code}</option>)}
            </select>
            <input 
              type="tel" 
              name="phone" 
              id="phone" 
              value={localFormData.phone} 
              onChange={(e) => handleInputChange('phone', e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNext();
                }
              }}
              className={`form-input custom-bg-input block w-full border rounded-r-lg py-2 px-3 focus:outline-none sm:text-sm ${errors.phone ? 'border-red-500' : ''}`} 
              style={{ backgroundColor: 'rgb(248, 249, 750)' }} 
              placeholder="Phone"
              disabled={isSubmitting}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        
        <div className="pt-4">
          <button 
            type="button" 
            onClick={handleNext} 
            disabled={isSubmitting} 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? <Spinner size="small" /> : 'Next'}
          </button>
          {errors.general && <p className="text-red-500 text-center mt-2">{errors.general}</p>}
        </div>
      </div>
    </>
  );
}

export default PersonalDetails;
