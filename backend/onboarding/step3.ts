import { api } from "encore.dev/api";

export interface Step3Data {
  [key: string]: string | boolean;
}

export interface SaveStep3Request {
  data: Step3Data;
}

export interface SaveStep3Response {
  success: boolean;
  message: string;
}

// Saves step 3 onboarding data.
export const saveStep3 = api<SaveStep3Request, SaveStep3Response>(
  { expose: true, method: "POST", path: "/api/onboarding/step3" },
  async (req) => {
    // Mock implementation - in a real app, this would save to database
    console.log("Saving step 3 data:", req.data);
    
    return {
      success: true,
      message: "Step 3 data saved successfully"
    };
  }
);
