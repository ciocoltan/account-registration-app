import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

export interface AuthenticateRequest {
  user: string;
  access_token: string;
  redirect?: boolean;
  remote_address?: string;
}

export interface AuthenticateResponse {
  url?: string;
  message: string;
  success: boolean;
}

// Generates a temporary unique URL for accessing the Syntellicore Member's area.
export const authenticate = api<AuthenticateRequest, AuthenticateResponse>(
  { expose: true, method: "POST", path: "/api/authenticate" },
  async (req) => {
    // Validate input
    if (!req.user || !req.access_token) {
      throw APIError.invalidArgument("User and access token are required");
    }

    try {
      const formData = new URLSearchParams();
      formData.append('user', req.user);
      formData.append('access_token', req.access_token);
      
      if (req.redirect !== undefined) {
        formData.append('redirect', req.redirect ? '1' : '0');
      }
      
      if (req.remote_address) {
        formData.append('remote_address', req.remote_address);
      }

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=user_authenticate`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      // Log the API request details
      console.log("=== SYNTELLICORE AUTHENTICATE API REQUEST ===");
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
      console.log("=== SYNTELLICORE AUTHENTICATE API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401) {
          throw APIError.unauthenticated("Invalid user or access token");
        }
        throw APIError.internal("Authentication failed");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from authentication service");
      }
      
      const successResponse = {
        url: data.url,
        message: data.message || "Authentication successful",
        success: true
      };

      console.log("Final response:", JSON.stringify(successResponse, null, 2));
      console.log("=== END SYNTELLICORE AUTHENTICATE API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE AUTHENTICATE API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Authentication API error:", error);
      throw APIError.internal("Authentication service unavailable");
    }
  }
);
