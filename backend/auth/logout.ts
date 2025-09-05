import { api, APIError, Cookie } from "encore.dev/api";
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
  loginCookie: Cookie<"login_creds">; // Return expired cookie to clear it
}

// Logs out a user by killing their access token and clearing login cookie
export const logout = api<LogoutRequest, LogoutResponse>(
  { expose: true, method: "POST", path: "/api/logout" },
  async (req) => {
    // Validate input
    if (!req.user || !req.access_token) {
      throw APIError.invalidArgument("User and access token are required");
    }

    try {
      const formData = new URLSearchParams();
      formData.append("user", req.user);
      formData.append("access_token", req.access_token);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=user_logout`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("=== SYNTELLICORE LOGOUT API REQUEST ===");
      console.log("URL:", requestUrl);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== SYNTELLICORE LOGOUT API RESPONSE ===");

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        throw APIError.internal("Logout failed");
      }

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        data = {};
      }

      // Create expired cookie to remove it from client
      const expiredCookie: Cookie<"login_creds"> = {
        value: "",
        expires: new Date(0), // Expire immediately
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        path: "/",
      };

      const successResponse: LogoutResponse = {
        message: data.message || "Logout successful",
        success: true,
        loginCookie: expiredCookie,
      };

      console.log("=== END SYNTELLICORE LOGOUT API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE LOGOUT API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);

      if (error.code) {
        throw error; // Re-throw APIError
      }
      throw APIError.internal("Logout service unavailable");
    }
  }
);
