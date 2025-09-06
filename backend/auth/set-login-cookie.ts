import { api, Cookie } from "encore.dev/api";
import { secret } from "encore.dev/config";
import crypto from "crypto";

const cookieEncryptionKey = secret("CookieEncryptionKey");

// AES-256-GCM encryption utility for securing user credentials in cookies
function encrypt(text: string): string {
  const key = Buffer.from(cookieEncryptionKey(), "utf8");
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  // Combine IV + Auth Tag + Encrypted Data
  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString("base64");
}

export interface SetLoginCookieRequest {
  email: string;
  password: string;
}

export interface SetLoginCookieResponse {
  message: string;
  success: boolean;
  // Secure cookie containing encrypted user credentials for auto-login
  loginCookie: Cookie<"login_creds">;
}

// Sets encrypted login credentials cookie for 30-day auto-login functionality
export const setLoginCookie = api<SetLoginCookieRequest, SetLoginCookieResponse>(
  { expose: true, method: "POST", path: "/api/set-login-cookie" },
  async (req) => {
    console.log("=== SETTING LOGIN COOKIE ===");
    console.log("Email:", req.email);

    // Validate input
    if (!req.email || !req.password) {
      throw new Error("Email and password are required");
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

    const response: SetLoginCookieResponse = {
      message: "Login cookie set successfully",
      success: true,
      loginCookie,
    };

    console.log("Login cookie set for 30 days");
    
    return response;
  }
);
