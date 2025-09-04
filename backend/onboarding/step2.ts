import { api } from "encore.dev/api";

export interface Step2Data {
  [key: string]: string | boolean;
}

export interface SaveStep2Request {
  data: Step2Data;
}

export interface SaveStep2Response {
  success: boolean;
  message: string;
}

// Saves step 2 onboarding data.
export const saveStep2 = api<SaveStep2Request, SaveStep2Response>(
  { expose: true, method: "POST", path: "/api/onboarding/step2" },
  async (req) => {
    // Mock implementation - in a real app, this would save to database
    console.log("Saving step 2 data:", req.data);
    
    return {
      success: true,
      message: "Step 2 data saved successfully"
    };
  }
);
