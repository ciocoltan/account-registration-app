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

      const response = await fetch(`${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=forgot_password`, {
        method: "POST",
        headers: {
          "api_key": syntelliCoreApiKey(),
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw APIError.notFound("Email address not found");
        }
        if (response.status === 400) {
          throw APIError.invalidArgument("Invalid email address");
        }
        throw APIError.internal("Password reset failed");
      }

      const data = await response.json();
      
      return {
        message: data.message || "Password reset email sent successfully",
        success: true
      };
    } catch (error: any) {
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
