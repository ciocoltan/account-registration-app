import { api, APIError, Cookie } from "encore.dev/api";
import { secret } from "encore.dev/config";
import crypto from "crypto";

// Configuration for Syntellicore CRM
const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");
const cookieEncryptionKey = secret("CookieEncryptionKey");

// AES-256-GCM decryption utility for reading encrypted user credentials from cookies
function decrypt(text: string): string {
  // Ensure the key is 32 bytes by hashing the secret
  const key = crypto.createHash('sha256').update(String(cookieEncryptionKey())).digest();
  const data = Buffer.from(text, "base64");

  // Extract IV (12 bytes), Auth Tag (16 bytes), and encrypted data
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

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

// Performs automatic login using encrypted credentials from secure cookie
export const autoLogin = api<AutoLoginRequest, AutoLoginResponse>(
  { expose: true, method: "POST", path: "/api/auto-login" },
  async (req) => {
    try {
      // Check if encrypted credentials cookie exists
      if (!req.loginCreds?.value) {
        throw APIError.unauthenticated("No login credentials found");
      }

      console.log("=== AUTO-LOGIN ATTEMPT ===");
      console.log("Encrypted credentials cookie found, attempting to decrypt...");

      // Decrypt cookie to extract email and password
      let email: string, password: string;
      try {
        const credentialsString = decrypt(req.loginCreds.value);
        [email, password] = credentialsString.split(":");
        console.log("Credentials decrypted successfully for email:", email);
      } catch (decryptError) {
        console.log("Failed to decrypt credentials:", decryptError);
        throw APIError.unauthenticated("Invalid or corrupted credentials");
      }

      if (!email || !password) {
        console.log("Decrypted credentials are incomplete");
        throw APIError.unauthenticated("Invalid credentials format");
      }

      // Use decrypted credentials to login with CRM
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=user_login`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("=== SYNTELLICORE AUTO-LOGIN API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Email:", email);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== SYNTELLICORE AUTO-LOGIN API RESPONSE ===");
      console.log("Status:", response.status);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Auto-login request failed with status:", response.status);
        throw APIError.unauthenticated("Auto-login failed - credentials may be invalid");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse auto-login response as JSON:", parseError);
        throw APIError.internal("Invalid response format from auto-login service");
      }

      // Validate CRM auto-login response
      if (!data.success || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.log("CRM auto-login API returned error or invalid response structure");
        throw APIError.unauthenticated("Auto-login failed - credentials may be invalid");
      }

      const userData = data.data[0];
      if (!userData.authentication_token || !userData.user) {
        console.log("CRM auto-login API returned success but missing authentication data");
        throw APIError.unauthenticated("Auto-login failed - credentials may be invalid");
      }

      const successResponse = {
        jwt: userData.authentication_token,
        message: data.info?.message || "Auto-login successful",
        user: userData.user,
        access_token: userData.authentication_token,
        success: true,
      };

      console.log("Auto-login successful for user:", userData.user);
      console.log("=== END SYNTELLICORE AUTO-LOGIN API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE AUTO-LOGIN API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);

      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Auto-login API error:", error);
      throw APIError.unauthenticated("Auto-login service failed");
    }
  }
);
