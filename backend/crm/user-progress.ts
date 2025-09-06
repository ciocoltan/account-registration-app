import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

// Configuration for Vault Markets CRM
const vaultMarketsUrl = secret("VaultMarketsUrl");
const vaultMarketsApiKey = secret("VaultMarketsApiKey");

// Interface for onboarding wizard step status
export interface OnboardingStep {
  owiz_step_id: string;
  title: string;
  status: string;
}

export interface GetOnboardWizardStepsRequest {
  user: string;
  access_token: string;
  owiz_id: string;
}

export interface GetOnboardWizardStepsResponse {
  success: boolean;
  steps: OnboardingStep[];
  message: string;
}

// Retrieves user's onboarding wizard progress from Vault Markets CRM
export const getOnboardWizardSteps = api<GetOnboardWizardStepsRequest, GetOnboardWizardStepsResponse>(
  { expose: true, method: "POST", path: "/api/onboard-wizard-steps" },
  async (req) => {
    // Validate required authentication parameters
    if (!req.user || !req.access_token) {
      throw APIError.unauthenticated("User and access token are required");
    }

    if (!req.owiz_id) {
      throw APIError.invalidArgument("Onboard wizard ID (owiz_id) is required");
    }

    try {
      console.log("=== VAULT MARKETS GET ONBOARD WIZARD STEPS API REQUEST ===");
      console.log("User:", req.user);
      console.log("Wizard ID:", req.owiz_id);

      // Prepare form data for CRM onboard wizard steps API
      const formData = new URLSearchParams();
      formData.append("user", req.user);
      formData.append("access_token", req.access_token);
      formData.append("owiz_id", req.owiz_id);

      // Call Vault Markets CRM get_onboard_wizard_user_steps_status endpoint
      const requestUrl = `${vaultMarketsUrl()}/gateway/api/6/syntellicore.cfc?method=get_onboard_wizard_user_steps_status`;
      const requestHeaders = {
        "api_key": vaultMarketsApiKey(),
      };

      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== VAULT MARKETS GET ONBOARD WIZARD STEPS API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid user credentials");
        }
        throw APIError.internal("Failed to fetch onboard wizard steps from CRM");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from onboard wizard service");
      }

      // Validate CRM onboard wizard steps response structure
      if (!data.success) {
        console.log("CRM API returned error:", data.info?.message || "Unknown error");
        throw APIError.internal("Failed to retrieve onboard wizard steps");
      }

      // Handle case where user has no steps yet
      const steps = data.data || [];

      const successResponse = {
        success: true,
        steps: steps,
        message: data.info?.message || "Onboard wizard steps retrieved successfully"
      };

      console.log("Onboard wizard steps retrieved successfully. Count:", steps.length);
      console.log("=== END VAULT MARKETS GET ONBOARD WIZARD STEPS API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== VAULT MARKETS GET ONBOARD WIZARD STEPS API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Get onboard wizard steps API error:", error);
      throw APIError.internal("Onboard wizard steps service unavailable");
    }
  }
);

export interface SetOnboardWizardStepStatusRequest {
  user: string;
  access_token: string;
  owiz_step_id: string;
  status: string;
}

export interface SetOnboardWizardStepStatusResponse {
  success: boolean;
  owiz_step_id: string;
  status: string;
  owizc_id: string;
  message: string;
}

// Updates user's onboarding wizard step status in Vault Markets CRM
export const setOnboardWizardStepStatus = api<SetOnboardWizardStepStatusRequest, SetOnboardWizardStepStatusResponse>(
  { expose: true, method: "POST", path: "/api/onboard-wizard-step-status" },
  async (req) => {
    // Validate required authentication parameters
    if (!req.user || !req.access_token) {
      throw APIError.unauthenticated("User and access token are required");
    }

    if (!req.owiz_step_id || !req.status) {
      throw APIError.invalidArgument("Wizard step ID and status are required");
    }

    try {
      console.log("=== VAULT MARKETS SET ONBOARD WIZARD STEP STATUS API REQUEST ===");
      console.log("User:", req.user);
      console.log("Step ID:", req.owiz_step_id);
      console.log("Status:", req.status);

      // Prepare form data for CRM onboard wizard step status API
      const formData = new URLSearchParams();
      formData.append("user", req.user);
      formData.append("access_token", req.access_token);
      formData.append("owiz_step_id", req.owiz_step_id);
      formData.append("status", req.status);

      // Call Vault Markets CRM set_onboard_wizard_user_step_status endpoint
      const requestUrl = `${vaultMarketsUrl()}/gateway/api/6/syntellicore.cfc?method=set_onboard_wizard_user_step_status`;
      const requestHeaders = {
        "api_key": vaultMarketsApiKey(),
      };

      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== VAULT MARKETS SET ONBOARD WIZARD STEP STATUS API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid user credentials");
        }
        throw APIError.internal("Failed to update onboard wizard step status in CRM");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from onboard wizard service");
      }

      // Validate CRM onboard wizard step status response
      if (!data.success) {
        console.log("CRM API returned error:", data.info?.message || "Unknown error");
        throw APIError.internal("Failed to update onboard wizard step status");
      }

      // Extract response data
      const stepData = data.data && data.data.length > 0 ? data.data[0] : {};

      const successResponse = {
        success: true,
        owiz_step_id: stepData.owiz_step_id || req.owiz_step_id,
        status: stepData.status || req.status,
        owizc_id: stepData.owizc_id || "",
        message: data.info?.message || "Onboard wizard step status updated successfully"
      };

      console.log("Onboard wizard step status updated successfully");
      console.log("=== END VAULT MARKETS SET ONBOARD WIZARD STEP STATUS API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== VAULT MARKETS SET ONBOARD WIZARD STEP STATUS API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Set onboard wizard step status API error:", error);
      throw APIError.internal("Onboard wizard step status service unavailable");
    }
  }
);
