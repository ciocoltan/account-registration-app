import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

export interface LogoutRequest {
  user: string;
  access_token: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

// Logs out a user by killing their access token.
export const logout = api<LogoutRequest, LogoutResponse>(
  { expose: true, method: "POST", path: "/api/logout" },
  async (req) => {
    // Validate input
    if (!req.user || !req.access_token) {
      throw APIError.invalidArgument("User and access token are required");
    }

    try {
      const formData = new URLSearchParams();
      formData.append('user', req.user);
      formData.append('access_token', req.access_token);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=user_logout`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      // Log the API request details
      console.log("=== SYNTELLICORE LOGOUT API REQUEST ===");
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
      console.log("=== SYNTELLICORE LOGOUT API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        throw APIError.internal("Logout failed");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        // For logout, we can still return success even if parsing fails
        data = {};
      }
      
      const successResponse = {
        message: data.message || "Logout successful",
        success: true
      };

      console.log("Final response:", JSON.stringify(successResponse, null, 2));
      console.log("=== END SYNTELLICORE LOGOUT API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE LOGOUT API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Logout API error:", error);
      throw APIError.internal("Logout service unavailable");
    }
  }
);
