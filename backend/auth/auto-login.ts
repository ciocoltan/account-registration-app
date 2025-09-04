import { api, APIError, Cookie } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

export interface AutoLoginRequest {
  loginCreds: Cookie<"login_creds">;
}

export interface AutoLoginResponse {
  jwt: string;
  message: string;
  user?: string;
  access_token?: string;
  success: boolean;
}

// Attempts to auto-login using encrypted credentials from cookie
export const autoLogin = api<AutoLoginRequest, AutoLoginResponse>(
  { expose: true, method: "POST", path: "/api/auto-login" },
  async (req) => {
    try {
      if (!req.loginCreds?.value) {
        throw APIError.unauthenticated("No login credentials found");
      }

      // Decrypt the credentials
      const credentialsString = Buffer.from(req.loginCreds.value, 'base64').toString('utf-8');
      const [email, password] = credentialsString.split(':');

      if (!email || !password) {
        throw APIError.unauthenticated("Invalid credentials format");
      }

      // Perform login using the decrypted credentials
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('password', password);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/1/syntellicore.cfc?method=user_login`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("=== SYNTELLICORE AUTO-LOGIN API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Body (FormData):", { email, password: "***" });

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== SYNTELLICORE AUTO-LOGIN API RESPONSE ===");

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Auto-login request failed with status:", response.status);
        throw APIError.unauthenticated("Auto-login failed - credentials may be invalid");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log("Failed to parse auto-login response as JSON:", parseError);
        throw APIError.internal("Invalid response format from auto-login service");
      }
      
      // Check if the response indicates success and extract authentication data
      if (!data.success || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.log("Auto-login API returned error or invalid response structure");
        throw APIError.unauthenticated("Auto-login failed - credentials may be invalid");
      }

      const userData = data.data[0];
      if (!userData.authentication_token) {
        console.log("Auto-login API returned success but missing authentication_token");
        throw APIError.unauthenticated("Auto-login failed - credentials may be invalid");
      }
      
      const successResponse = {
        jwt: userData.authentication_token,
        message: "Auto-login successful",
        user: userData.user,
        access_token: userData.authentication_token,
        success: true
      };

      console.log("=== END SYNTELLICORE AUTO-LOGIN API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE AUTO-LOGIN API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Auto-login API error:", error);
      throw APIError.unauthenticated("Auto-login service failed");
    }
  }
);
