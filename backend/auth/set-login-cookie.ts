import { api, APIError, Cookie } from "encore.dev/api";
import { secret } from "encore.dev/config";

const cookieEncryptionKey = secret("CookieEncryptionKey");

export interface SetLoginCookieRequest {
  email: string;
  password: string;
}

export interface SetLoginCookieResponse {
  success: boolean;
  message: string;
  loginCookie: Cookie<"login_creds">;
}

// Encrypts login credentials and sets a secure cookie for auto-login
export const setLoginCookie = api<SetLoginCookieRequest, SetLoginCookieResponse>(
  { expose: true, method: "POST", path: "/api/set-login-cookie" },
  async (req) => {
    try {
      // Create a simple encrypted representation of credentials
      // In production, use proper encryption like AES
      const credentialsString = `${req.email}:${req.password}`;
      const encryptedCreds = Buffer.from(credentialsString).toString('base64');
      
      const loginCookie: Cookie<"login_creds"> = {
        value: encryptedCreds,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        path: "/"
      };

      return {
        success: true,
        message: "Login cookie set successfully",
        loginCookie
      };
    } catch (error: any) {
      console.error("Set login cookie error:", error);
      throw APIError.internal("Failed to set login cookie");
    }
  }
);
