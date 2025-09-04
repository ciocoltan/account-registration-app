import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  [key: string]: string | boolean;
}

interface PublicOfficialStatusProps {
  formData?: FormData;
  onSaveData?: (data: FormData) => void;
  onNext?: () => void;
}

function PublicOfficialStatus({ formData = {}, onSaveData, onNext }: PublicOfficialStatusProps) {
  const navigate = useNavigate();
  const [localData, setLocalData] = useState<FormData>(formData);

  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  const handleInputChange = (name: string, value: string | boolean) => {
    const newData = { ...localData, [name]: value };
    setLocalData(newData);
    onSaveData?.(newData);
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      navigate('/en/apply/employment-status');
    }
  };

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

export default PublicOfficialStatus;
