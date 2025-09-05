import { api, APIError, Cookie } from "encore.dev/api";
import { secret } from "encore.dev/config";
import crypto from "crypto";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");
const cookieEncryptionKey = secret("CookieEncryptionKey");

// Utility: decrypt AES-GCM
function decrypt(text: string): string {
  const key = Buffer.from(cookieEncryptionKey(), "utf8");
  const data = Buffer.from(text, "base64");

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

export const autoLogin = api<AutoLoginRequest, AutoLoginResponse>(
  { expose: true, method: "POST", path: "/api/auto-login" },
  async (req) => {
    try {
      if (!req.loginCreds?.value) {
        throw APIError.unauthenticated("No login credentials found");
      }

      // 🔑 Decrypt cookie into email:password
      let email: string, password: string;
      try {
        const credentialsString = decrypt(req.loginCreds.value);
        [email, password] = credentialsString.split(":");
      } catch {
        throw APIError.unauthenticated("Invalid or corrupted credentials");
      }

      if (!email || !password) {
        throw APIError.unauthenticated("Invalid credentials format");
      }

      // 🔄 Reuse login API
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/1/syntellicore.cfc?method=user_login`;
      const requestHeaders = {
        api_key: syntelliCoreApiKey(),
      };

      console.log("=== SYNTELLICORE AUTO-LOGIN API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Email:", email);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        throw APIError.unauthenticated("Auto-login failed - credentials may be invalid");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log("Failed to parse auto-login response as JSON:", parseError);
        throw APIError.internal("Invalid response format from auto-login service");
      }

      if (!data.success || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        throw APIError.unauthenticated("Auto-login failed - credentials may be invalid");
      }

      const userData = data.data[0];
      if (!userData.authentication_token) {
        throw APIError.unauthenticated("Auto-login failed - credentials may be invalid");
      }

      return {
        jwt: userData.authentication_token,
        message: "Auto-login successful",
        user: userData.user,
        access_token: userData.authentication_token,
        success: true,
      };
    } catch (error: any) {
      console.log("=== SYNTELLICORE AUTO-LOGIN API ERROR ===");
      console.error(error);

      if (error instanceof APIError) throw error;
      throw APIError.unauthenticated("Auto-login service failed");
    }
  }
);
