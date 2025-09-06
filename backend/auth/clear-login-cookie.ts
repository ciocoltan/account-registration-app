import { api, Cookie } from "encore.dev/api";

export interface ClearLoginCookieRequest {}

export interface ClearLoginCookieResponse {
  message: string;
  success: boolean;
  // Expired cookie to clear login credentials from client
  loginCookie: Cookie<"login_creds">;
}

// Clears the encrypted login credentials cookie from client browser
export const clearLoginCookie = api<ClearLoginCookieRequest, ClearLoginCookieResponse>(
  { expose: true, method: "POST", path: "/api/clear-login-cookie" },
  async (req) => {
    console.log("=== CLEARING LOGIN COOKIE ===");

    // Create expired cookie to remove login credentials from client
    const expiredCookie: Cookie<"login_creds"> = {
      value: "",
      expires: new Date(0), // Expire immediately
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/",
    };

    const response: ClearLoginCookieResponse = {
      message: "Login cookie cleared successfully",
      success: true,
      loginCookie: expiredCookie,
    };

    console.log("Login cookie cleared");
    
    return response;
  }
);
