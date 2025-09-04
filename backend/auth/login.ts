import { api, APIError } from "encore.dev/api";

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

    // Mock authentication logic
    if (req.email === "test@example.com" && req.password === "password") {
      const jwt = `mock-jwt-token-${Date.now()}`;
      return {
        jwt,
        message: "Login successful"
      };
    }

    throw APIError.unauthenticated("Invalid email or password");
  }
);
