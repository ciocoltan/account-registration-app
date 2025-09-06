import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackend } from '../../hooks/useBackend';
import { useFormData } from '../../contexts/FormDataContext';
import type { Country } from '~backend/auth/countries';

const defaultCountries: Country[] = [
  { country_id: 1, name: 'United States', iso_alpha2_code: 'US', iso_alpha3_code: 'USA', tel_country_code: '1', show_on_register: 1, currency: 'USD', currency_id: 1, brand_id: 1, zone: 'America' },
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

function ResidenceAddress() {
  const navigate = useNavigate();
  const backend = useBackend();
  const { formData, updateFormData } = useFormData();
  const [countries, setCountries] = useState<Country[]>(defaultCountries);
  const [localFormData, setLocalFormData] = useState({
    residenceCountry: formData.residenceCountry || '',
    notUsCitizen: formData.notUsCitizen || false,
    agreedToTerms: formData.agreedToTerms || false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set default country
    setLocalFormData(prev => ({
      ...prev,
      residenceCountry: prev.residenceCountry || defaultCountries[18].name // Default to Israel (index 18)
    }));

    const fetchCountries = async () => {
      try {
        const response = await backend.auth.getCountries({});
        setCountries(response.countries);

        // Update default if we have better data from API
        if (response.countries.length > 0) {
          const israelCountry = response.countries.find(c => c.iso_alpha2_code === 'IL') || response.countries[0];
          setLocalFormData(prev => ({
            ...prev,
            residenceCountry: prev.residenceCountry || israelCountry.name
          }));
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        // Keep default countries if API fails
      }
    };

    fetchCountries();
  }, [backend]);

  const handleInputChange = (name: string, value: string | boolean) => {
    setLocalFormData(prev => ({ ...prev, [name]: value }));
    
    // Update global form data
    updateFormData({ [name]: value });
    
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
    
    if (!localFormData.notUsCitizen) newErrors['notUsCitizen'] = 'You must confirm your US tax status';
    if (!localFormData.agreedToTerms) newErrors['agreedToTerms'] = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      // Save all form data before navigating
      updateFormData(localFormData);
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
          value={localFormData.residenceCountry}
          onChange={(e) => handleInputChange('residenceCountry', e.target.value)}
          className="form-input custom-bg-input mt-1 block w-full border rounded-lg py-2 px-3 focus:outline-none sm:text-sm"
          style={{ backgroundColor: 'rgb(248, 249, 250)' }}
        >
          <option value="">Select Country</option>
          {countries.map(country => (
            <option key={country.country_id} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="pt-2 space-y-3">
        <div>
          <div className="flex items-center">
            <input
              id="not-us-citizen"
              name="notUsCitizen"
              type="checkbox"
              checked={localFormData.notUsCitizen}
              onChange={(e) => handleInputChange('notUsCitizen', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="not-us-citizen" className="ml-2 block text-sm text-gray-900">
              I am not a citizen or resident of the United States of America for tax purposes.
            </label>
          </div>
          {errors.notUsCitizen && (
            <p className="text-red-500 text-sm mt-1 ml-6">{errors.notUsCitizen}</p>
          )}
        </div>
        
        <div>
          <div className="flex items-center">
            <input
              id="terms-conditions"
              name="agreedToTerms"
              type="checkbox"
              checked={localFormData.agreedToTerms}
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
