import { api, Cookie } from "encore.dev/api";

export interface ClearLoginCookieResponse {
  success: boolean;
  message: string;
  loginCookie: Cookie<"login_creds">;
}

// Clears the login credentials cookie
export const clearLoginCookie = api<void, ClearLoginCookieResponse>(
  { expose: true, method: "POST", path: "/api/clear-login-cookie" },
  async () => {
    const loginCookie: Cookie<"login_creds"> = {
      value: "",
      expires: new Date(0), // Expire immediately
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/"
    };

    return {
      success: true,
      message: "Login cookie cleared successfully",
      loginCookie
    };
  }
);
