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

      const response = await fetch(`${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=user_logout`, {
        method: "POST",
        headers: {
          "api_key": syntelliCoreApiKey(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw APIError.internal("Logout failed");
      }

      const data = await response.json();
      
      return {
        message: data.message || "Logout successful",
        success: true
      };
    } catch (error: any) {
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Logout API error:", error);
      throw APIError.internal("Logout service unavailable");
    }
  }
);
