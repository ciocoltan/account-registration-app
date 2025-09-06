import { api, APIError, Cookie } from "encore.dev/api";
import { secret } from "encore.dev/config";
import crypto from "crypto";

// Configuration for Syntellicore CRM
const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");
const cookieEncryptionKey = secret("CookieEncryptionKey");

// AES-256-GCM encryption utility for securing user credentials in cookies
function encrypt(text: string): string {
  // Ensure the key is 32 bytes by hashing the secret
  const key = crypto.createHash('sha256').update(String(cookieEncryptionKey())).digest();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  // Combine IV + Auth Tag + Encrypted Data
  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString("base64");
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
  message: string;
  user?: string;
  access_token?: string;
  success: boolean;
  // Secure cookie containing encrypted user credentials for auto-login
  loginCookie: Cookie<"login_creds">;
}

// Authenticates user with Syntellicore CRM and sets secure encrypted cookie for 30 days
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/api/login" },
  async (req) => {
    // Validate input data
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    // Basic email pattern validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(req.email)) {
      throw APIError.invalidArgument("Invalid email format");
    }

    try {
      // Prepare form data for CRM login API
      const formData = new URLSearchParams();
      formData.append("email", req.email);
      formData.append("password", req.password);

      // Call Syntellicore CRM user_login endpoint
      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=user_login`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("=== SYNTELLICORE LOGIN API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Email:", req.email);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== SYNTELLICORE LOGIN API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid email or password");
        }
        throw APIError.internal("Login failed");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from login service");
      }

      // Validate CRM response structure
      if (!data.success || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.log("CRM API returned error or invalid response structure");
        throw APIError.unauthenticated("Invalid email or password");
      }

      const userData = data.data[0];
      if (!userData.authentication_token || !userData.user) {
        console.log("CRM API returned success but missing required fields");
        throw APIError.unauthenticated("Invalid email or password");
      }

      // Create encrypted cookie with user credentials for 30-day auto-login
      // Format: "email:password" encrypted with AES-256-GCM
      const credentialsString = `${req.email}:${req.password}`;
      const encryptedCredentials = encrypt(credentialsString);

      const loginCookie: Cookie<"login_creds"> = {
        value: encryptedCredentials,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
      };

      const successResponse = {
        jwt: userData.authentication_token,
        message: data.info?.message || "Login successful",
        user: userData.user,
        access_token: userData.authentication_token,
        success: true,
        loginCookie,
      };

      console.log("Final response:", JSON.stringify({ ...successResponse, loginCookie: "***encrypted***" }, null, 2));
      console.log("=== END SYNTELLICORE LOGIN API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE LOGIN API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Login API error:", error);
      throw APIError.internal("Login service unavailable");
    }
  }
);
