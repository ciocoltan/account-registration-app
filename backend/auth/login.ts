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

      const response = await fetch(`${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=user_login`, {
        method: "POST",
        headers: {
          "api_key": syntelliCoreApiKey(),
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid email or password");
        }
        throw APIError.internal("Login failed");
      }

      const data = await response.json();
      
      // Check if the response indicates success
      if (data.error || !data.access_token) {
        throw APIError.unauthenticated("Invalid email or password");
      }
      
      return {
        jwt: data.access_token,
        message: "Login successful",
        user: data.user,
        access_token: data.access_token
      };
    } catch (error: any) {
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Login API error:", error);
      throw APIError.internal("Login service unavailable");
    }
  }
);
