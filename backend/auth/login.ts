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
      formData.append('google', '0');

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=user_login`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      // Log the API request details
      console.log("=== SYNTELLICORE LOGIN API REQUEST ===");
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
      console.log("=== SYNTELLICORE LOGIN API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

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
      
      // Check if the response indicates success
      if (data.error || !data.access_token) {
        console.log("API returned error or missing access_token:", data.error || "No access_token");
        throw APIError.unauthenticated("Invalid email or password");
      }
      
      const successResponse = {
        jwt: data.access_token,
        message: "Login successful",
        user: data.user,
        access_token: data.access_token
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
