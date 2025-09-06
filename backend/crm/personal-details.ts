import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

// Configuration for Syntellicore CRM
const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

// Interface for personal details form data
export interface PersonalDetailsSubmission {
  eqaq_id: string;
  eqaa_id?: number;
  eqaa_text: string;
}

export interface SetPersonalDetailsRequest {
  user: string;
  access_token: string;
  firstName: string;
  lastName: string;
  nationality: string;
  nationalityText: string;
}

export interface SetPersonalDetailsResponse {
  success: boolean;
  message: string;
}

// Submits personal details form data to Syntellicore CRM questionnaire
export const setPersonalDetails = api<SetPersonalDetailsRequest, SetPersonalDetailsResponse>(
  { expose: true, method: "POST", path: "/api/personal-details" },
  async (req) => {
    // Validate required authentication parameters
    if (!req.user || !req.access_token) {
      throw APIError.unauthenticated("User and access token are required");
    }

    if (!req.firstName || !req.lastName || !req.nationality || !req.nationalityText) {
      throw APIError.invalidArgument("Personal details are required");
    }

    try {
      console.log("=== SYNTELLICORE SET PERSONAL DETAILS API REQUEST ===");
      console.log("User:", req.user);
      console.log("First Name:", req.firstName);
      console.log("Last Name:", req.lastName);
      console.log("Nationality:", req.nationalityText);

      // Build the questionnaire answers array based on the curl example
      const personalDetailsAnswers: PersonalDetailsSubmission[] = [
        {
          eqaq_id: "58",
          eqaa_text: req.firstName
        },
        {
          eqaq_id: "60",
          eqaa_text: req.lastName
        },
        {
          eqaq_id: "91",
          eqaa_text: "CeciltanIDnumber"
        },
        {
          eqaq_id: "63",
          eqaa_id: parseInt(req.nationality),
          eqaa_text: req.nationalityText
        },
        {
          eqaq_id: "68",
          eqaa_text: "lefkippou 11"
        },
        {
          eqaq_id: "69",
          eqaa_text: "Limassol"
        },
        {
          eqaq_id: "70",
          eqaa_text: "3075"
        },
        {
          eqaq_id: "72",
          eqaa_id: 1678,
          eqaa_text: "No"
        },
        {
          eqaq_id: "71",
          eqaa_id: 3565,
          eqaa_text: "No"
        }
      ];

      // Prepare form data for CRM questionnaire answers API
      const formData = new URLSearchParams();
      formData.append("user", req.user);
      formData.append("access_token", req.access_token);
      
      // Convert answers array to JSON string as expected by CRM API
      const answersJson = JSON.stringify(personalDetailsAnswers);
      formData.append("eqa_multiple_answers", answersJson);

      // Call Syntellicore CRM set_questionnaire_user_answers endpoint
      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=set_questionnaire_user_answers`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Personal Details Answers JSON:", answersJson);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== SYNTELLICORE SET PERSONAL DETAILS API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid user credentials");
        }
        throw APIError.internal("Failed to save personal details to CRM");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from personal details service");
      }

      // Validate CRM personal details response
      if (!data.success) {
        console.log("CRM API returned error:", data.info?.message || "Unknown error");
        throw APIError.internal("Failed to save personal details");
      }

      const successResponse = {
        success: true,
        message: data.info?.message || "Personal details saved successfully"
      };

      console.log("Personal details saved successfully for user:", req.user);
      console.log("=== END SYNTELLICORE SET PERSONAL DETAILS API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE SET PERSONAL DETAILS API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Set personal details API error:", error);
      throw APIError.internal("Personal details service unavailable");
    }
  }
);
