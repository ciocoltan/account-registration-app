import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");

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
      const response = await fetch(`${syntelliCoreUrl()}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: req.email,
        }),
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
      throw APIError.internal("Password reset service unavailable");
    }
  }
);
