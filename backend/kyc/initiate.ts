import { api } from "encore.dev/api";

export interface InitiateKycResponse {
  accessToken: string;
  success: boolean;
}

// Initiates the KYC verification process.
export const initiate = api<void, InitiateKycResponse>(
  { expose: true, method: "POST", path: "/api/kyc/initiate" },
  async () => {
    // Mock implementation - in a real app, this would integrate with Sumsub
    const accessToken = `mock-sumsub-access-token-${Date.now()}`;
    
    return {
      accessToken,
      success: true
    };
  }
);
