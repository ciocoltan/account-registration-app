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

      const response = await fetch(`${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=user_authenticate`, {
        method: "POST",
        headers: {
          "api_key": syntelliCoreApiKey(),
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw APIError.unauthenticated("Invalid user or access token");
        }
        throw APIError.internal("Authentication failed");
      }

      const data = await response.json();
      
      return {
        url: data.url,
        message: data.message || "Authentication successful",
        success: true
      };
    } catch (error: any) {
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Authentication API error:", error);
      throw APIError.internal("Authentication service unavailable");
    }
  }
);
