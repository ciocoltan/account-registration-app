import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

export interface RegisterRequest {
  email: string;
  password: string;
  countryId: string;
  currency: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResponse {
  jwt: string;
  message: string;
  user?: string;
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
      const formData = new URLSearchParams();
      formData.append('email', req.email);
      formData.append('password', req.password);
      formData.append('country_id', req.countryId);
      formData.append('currency', req.currency);
      formData.append('google', '0');
      formData.append('verify', '1');
      formData.append('auto_responder_enable', '1');
      
      if (req.firstName) {
        formData.append('fname', req.firstName);
      }
      if (req.lastName) {
        formData.append('lname', req.lastName);
      }

      const response = await fetch(`${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=create_user`, {
        method: "POST",
        headers: {
          "api_key": syntelliCoreApiKey(),
        },
        body: formData,
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
      
      // Check if the response indicates an error
      if (data.error) {
        if (data.error.toLowerCase().includes('email') && data.error.toLowerCase().includes('exists')) {
          throw APIError.alreadyExists("User with this email already exists");
        }
        throw APIError.invalidArgument(data.error);
      }
      
      // For registration, we might need to do a login call to get the access token
      // or use the returned user data to generate a token
      const mockToken = `registered-${Date.now()}`;
      
      return {
        jwt: mockToken,
        message: "User registered successfully",
        user: data.user || data.customer_no
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
