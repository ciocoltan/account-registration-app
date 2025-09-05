import { api, APIError, Cookie } from "encore.dev/api";
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
  loginCookie: Cookie<"login_token">; // ⬅️ new field
}

// Authenticates a user, sets secure cookie, and returns JWT
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/api/login" },
  async (req) => {
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    try {
      const formData = new URLSearchParams();
      formData.append("email", req.email);
      formData.append("password", req.password);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/1/syntellicore.cfc?method=user_login`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("=== SYNTELLICORE LOGIN API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid email or password");
        }
        throw APIError.internal("Login failed");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw APIError.internal("Invalid response format from login service");
      }

      if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
        throw APIError.unauthenticated("Invalid email or password");
      }

      const userData = data.data[0];
      if (!userData.authentication_token) {
        throw APIError.unauthenticated("Invalid email or password");
      }

      // 🔒 Create secure cookie with JWT (not raw password)
      const loginCookie: Cookie<"login_token"> = {
        value: userData.authentication_token,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
      };

      const successResponse = {
        jwt: userData.authentication_token,
        message: "Login successful",
        user: userData.user,
        access_token: userData.authentication_token,
        loginCookie,
      };

      console.log("=== END SYNTELLICORE LOGIN API ===");
      return successResponse;

    } catch (error: any) {
      console.log("=== SYNTELLICORE LOGIN API ERROR ===");
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal("Login service unavailable");
    }
  }
);
