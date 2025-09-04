import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
  message: string;
  user?: string;
  access_token?: string;
}

// Authenticates a user and returns a JWT token.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/api/login" },
  async (req) => {
    // Validate input
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    try {
      const formData = new URLSearchParams();
      formData.append('email', req.email);
      formData.append('password', req.password);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/1/syntellicore.cfc?method=user_login`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      // Log the API request details
      console.log("=== SYNTELLICORE LOGIN API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Method: POST");
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));
      //console.log("Raw FormData string:", formData.toString());

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      // Log the response details
      console.log("=== SYNTELLICORE LOGIN API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid email or password");
        }
        throw APIError.internal("Login failed");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from login service");
      }
      
      // Check if the response indicates success and extract authentication data
      if (!data.success || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.log("API returned error or invalid response structure");
        throw APIError.unauthenticated("Invalid email or password");
      }

      const userData = data.data[0];
      if (!userData.authentication_token) {
        console.log("API returned success but missing authentication_token");
        throw APIError.unauthenticated("Invalid email or password");
      }
      
      const successResponse = {
        jwt: userData.authentication_token,
        message: "Login successful",
        user: userData.user,
        access_token: userData.authentication_token
      };

      console.log("Final response:", JSON.stringify(successResponse, null, 2));
      console.log("=== END SYNTELLICORE LOGIN API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE LOGIN API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Login API error:", error);
      throw APIError.internal("Login service unavailable");
    }
  }
);
