import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

export interface RegisterRequest {
  email: string;
  password: string;
  countryId: string;
  currency: string;
}

export interface RegisterResponse {
  jwt: string;
  message: string;
  user?: string;
}

// Registers a new user account.
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/api/register-user" },
  async (req) => {
    // Validate input
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    try {
      const formData = new URLSearchParams();
      formData.append('email', req.email);
      formData.append('password', req.password);
      formData.append('country_id', req.countryId);
      formData.append('currency', req.currency);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=create_user`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      // Log the API request details
      console.log("=== SYNTELLICORE REGISTER API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Method: POST");
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));
      console.log("Raw FormData string:", formData.toString());

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      // Log the response details
      console.log("=== SYNTELLICORE REGISTER API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 409) {
          throw APIError.alreadyExists("User with this email already exists");
        }
        if (response.status === 400) {
          throw APIError.invalidArgument("Invalid registration data");
        }
        throw APIError.internal("Registration failed");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from registration service");
      }
      
      // Check if the response indicates an error
      if (data.error) {
        console.log("API returned error:", data.error);
        if (data.error.toLowerCase().includes('email') && data.error.toLowerCase().includes('exists')) {
          throw APIError.alreadyExists("User with this email already exists");
        }
        throw APIError.invalidArgument(data.error);
      }
      
      // For registration, we might need to do a login call to get the access token
      // or use the returned user data to generate a token
      const mockToken = `registered-${Date.now()}`;
      
      const successResponse = {
        jwt: mockToken,
        message: "User registered successfully",
        user: data.user || data.customer_no
      };

      console.log("Final response:", JSON.stringify(successResponse, null, 2));
      console.log("=== END SYNTELLICORE REGISTER API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE REGISTER API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Registration API error:", error);
      throw APIError.internal("Registration service unavailable");
    }
  }
);
