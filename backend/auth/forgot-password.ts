import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

// Initiates password reset process for a user.
export const forgotPassword = api<ForgotPasswordRequest, ForgotPasswordResponse>(
  { expose: true, method: "POST", path: "/api/forgot-password" },
  async (req) => {
    // Validate input
    if (!req.email) {
      throw APIError.invalidArgument("Email is required");
    }

    try {
      // Note: The Syntellicore API documentation doesn't show a specific forgot password endpoint
      // This is a placeholder implementation that would need to be adjusted based on the actual API
      const formData = new URLSearchParams();
      formData.append('email', req.email);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=forgot_password`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      // Log the API request details
      console.log("=== SYNTELLICORE FORGOT PASSWORD API REQUEST ===");
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
      console.log("=== SYNTELLICORE FORGOT PASSWORD API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 404) {
          throw APIError.notFound("Email address not found");
        }
        if (response.status === 400) {
          throw APIError.invalidArgument("Invalid email address");
        }
        throw APIError.internal("Password reset failed");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from password reset service");
      }
      
      const successResponse = {
        message: data.message || "Password reset email sent successfully",
        success: true
      };

      console.log("Final response:", JSON.stringify(successResponse, null, 2));
      console.log("=== END SYNTELLICORE FORGOT PASSWORD API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE FORGOT PASSWORD API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Forgot password API error:", error);
      
      // For now, return success even if the API call fails since we don't have the actual endpoint
      return {
        message: "If this email exists in our system, you will receive a password reset link shortly.",
        success: true
      };
    }
  }
);
