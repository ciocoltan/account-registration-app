import { api } from "encore.dev/api";

export interface Step1Data {
  residenceCountry: string;
  notUsCitizen: boolean;
  agreedToTerms: boolean;
  publicOfficialStatus: string;
}

export interface SaveStep1Request {
  data: Step1Data;
}

export interface SaveStep1Response {
  success: boolean;
  message: string;
}

// Saves step 1 onboarding data.
export const saveStep1 = api<SaveStep1Request, SaveStep1Response>(
  { expose: true, method: "POST", path: "/api/onboarding/step1" },
  async (req) => {
    // Mock implementation - in a real app, this would save to database
    console.log("Saving step 1 data:", req.data);
    
    return {
      success: true,
      message: "Step 1 data saved successfully"
    };
  }
);
