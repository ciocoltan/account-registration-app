import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
  message: string;
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
      const response = await fetch(`${syntelliCoreUrl()}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: req.email,
          password: req.password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw APIError.unauthenticated("Invalid email or password");
        }
        throw APIError.internal("Login failed");
      }

      const data = await response.json();
      
      return {
        jwt: data.jwt || data.token || `mock-jwt-${Date.now()}`,
        message: data.message || "Login successful"
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
