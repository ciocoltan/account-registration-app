import React from 'react';
import { Clipboard } from 'lucide-react';
import { useBackend } from '../../hooks/useBackend';

function VerificationStep() {
  const backend = useBackend();

  const handleInitiateKyc = async () => {
    try {
      const response = await backend.kyc.initiate();
      console.log('KYC initiated:', response);
      // Handle KYC initiation success
    } catch (error) {
      console.error('Failed to initiate KYC:', error);
    }
  };

  return (
    <div className="text-center">
      <div className="p-8 border rounded-lg">
        <h2 className="text-xl font-bold text-gray-800">To Continue</h2>
        <p className="text-gray-500 mt-2 mb-6">Please follow the steps below</p>
        <div className="flex items-center text-left p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-white rounded-full border shadow-sm mr-4">
            <Clipboard className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Step 1</p>
            <p className="font-semibold text-gray-800">Provide identity document</p>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={handleInitiateKyc}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Continue on this device
        </button>
        <button
          type="button"
          className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-full shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Continue on phone
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-6">Powered by <span className="font-bold">sumsub</span></p>
    </div>
  );
}

export default VerificationStep;
