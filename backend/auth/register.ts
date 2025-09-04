import { api, APIError } from "encore.dev/api";

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

    // Check if user already exists (mock implementation)
    if (req.email === "existing@example.com") {
      throw APIError.alreadyExists("User with this email already exists");
    }

    // Mock JWT generation
    const jwt = `mock-jwt-token-${Date.now()}`;

    return {
      jwt,
      message: "User registered successfully"
    };
  }
);
