import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");

export interface RegisterRequest {
  email: string;
  password: string;
  countryId: string;
  currency: string;
}

export interface RegisterResponse {
  jwt: string;
  message: string;
}

// Registers a new user account.
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/api/register-user" },
  async (req) => {
    // Validate input
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    try {
      const response = await fetch(`${syntelliCoreUrl()}/api/register-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: req.email,
          password: req.password,
          countryId: req.countryId,
          currency: req.currency,
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw APIError.alreadyExists("User with this email already exists");
        }
        if (response.status === 400) {
          throw APIError.invalidArgument("Invalid registration data");
        }
        throw APIError.internal("Registration failed");
      }

      const data = await response.json();
      
      return {
        jwt: data.jwt || data.token || `mock-jwt-${Date.now()}`,
        message: data.message || "User registered successfully"
      };
    } catch (error: any) {
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Registration API error:", error);
      throw APIError.internal("Registration service unavailable");
    }
  }
);
