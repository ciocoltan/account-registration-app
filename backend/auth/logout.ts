import { api, APIError, Cookie } from "encore.dev/api";
import { secret } from "encore.dev/config";

// Configuration for Vault Markets CRM
const vaultMarketsUrl = secret("VaultMarketsUrl");
const vaultMarketsApiKey = secret("VaultMarketsApiKey");

export interface LogoutRequest {
  user: string;
  access_token: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
  // Expired cookie to clear login credentials from client
  loginCookie: Cookie<"login_creds">;
}

// Logs out user from Vault Markets CRM and clears secure login cookie
export const logout = api<LogoutRequest, LogoutResponse>(
  { expose: true, method: "POST", path: "/api/logout" },
  async (req) => {
    // Validate required logout parameters
    if (!req.user || !req.access_token) {
      throw APIError.invalidArgument("User and access token are required");
    }

    try {
      console.log("=== VAULT MARKETS LOGOUT PROCESS ===");
      console.log("User:", req.user);

      // Prepare form data for CRM logout API
      const formData = new URLSearchParams();
      formData.append("user", req.user);
      formData.append("access_token", req.access_token);

      // Call Vault Markets CRM user_logout endpoint
      const requestUrl = `${vaultMarketsUrl()}/gateway/api/6/syntellicore.cfc?method=user_logout`;
      const requestHeaders = {
        "api_key": vaultMarketsApiKey(),
      };

      console.log("=== VAULT MARKETS LOGOUT API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== VAULT MARKETS LOGOUT API RESPONSE ===");
      console.log("Status:", response.status);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Logout request failed with status:", response.status);
        // Continue with logout process even if CRM call fails
      }

      let data: any = {};
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse logout response as JSON:", parseError);
        // Continue with logout process even if response parsing fails
      }

      // Create expired cookie to remove login credentials from client
      const expiredCookie: Cookie<"login_creds"> = {
        value: "",
        expires: new Date(0), // Expire immediately
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
      };

      const successResponse: LogoutResponse = {
        message: data.info?.message || "Logout successful",
        success: true,
        loginCookie: expiredCookie,
      };

      console.log("Logout completed for user:", req.user);
      console.log("=== END VAULT MARKETS LOGOUT API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== VAULT MARKETS LOGOUT API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);

      // Even if CRM logout fails, clear the local cookie
      const expiredCookie: Cookie<"login_creds"> = {
        value: "",
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
      };

      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Logout API error:", error);
      
      // Return success even if CRM call failed - important to clear client-side state
      return {
        message: "Logout completed (CRM may be unavailable)",
        success: true,
        loginCookie: expiredCookie,
      };
    }
  }
);
