import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

export interface RegisterRequest {
  email: string;
  password: string;
  currency: string;
  countryCode: string;
}

export interface RegisterResponse {
  jwt: string;
  message: string;
  user?: string;
  access_token?: string;
  success: boolean;
}

// Gets country ID by country code from Syntellicore countries API
async function getCountryIdByCode(countryCode: string): Promise<string> {
  try {
    const formData = new URLSearchParams();
    formData.append('language', 'en');
    formData.append('show_on_register', '1');

    const response = await fetch(`${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=get_countries`, {
      method: "POST",
      headers: {
        "api_key": syntelliCoreApiKey(),
      },
      body: formData,
    });

    if (!response.ok) {
      console.log("Countries API failed, using default country ID");
      return "3"; // Default fallback
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.log("Failed to parse countries response as JSON:", parseError);
      return "3"; // Default fallback
    }

    const countries = data.data || data.countries || [];
    
    if (Array.isArray(countries)) {
      const country = countries.find((c: any) => 
        c.iso_alpha2_code === countryCode || 
        c.country_code === countryCode ||
        c.code === countryCode
      );
      
      if (country) {
        return country.country_id || country.id || "3";
      }
    }
    
    console.log("Country not found for code:", countryCode, "using default");
    return "3"; // Default fallback
  } catch (error) {
    console.log("Error getting country ID:", error);
    return "3"; // Default fallback
  }
}

// Performs login after registration
async function performLogin(email: string, password: string): Promise<{ jwt: string; user: string; access_token: string }> {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('password', password);

  const requestUrl = `${syntelliCoreUrl()}/gateway/api/1/syntellicore.cfc?method=user_login`;
  const requestHeaders = {
    "api_key": syntelliCoreApiKey(),
  };

  console.log("=== SYNTELLICORE AUTO-LOGIN AFTER REGISTER API REQUEST ===");
  console.log("URL:", requestUrl);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: requestHeaders,
    body: formData,
  });

  const responseText = await response.text();
  console.log("Raw Login Response Body:", responseText);

  if (!response.ok) {
    console.log("Auto-login request failed with status:", response.status);
    throw APIError.internal("Auto-login after registration failed");
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
    throw APIError.internal("Auto-login after registration failed");
  }

  const userData = data.data[0];
  if (!userData.authentication_token) {
    console.log("Auto-login API returned success but missing authentication_token");
    throw APIError.internal("Auto-login after registration failed");
  }

  return {
    jwt: userData.authentication_token,
    user: userData.user,
    access_token: userData.authentication_token
  };
}

export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/api/register-user" },
  async (req) => {
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    try {
      console.log("=== GETTING COUNTRY BY CODE ===");
      const countryId = await getCountryIdByCode(req.countryCode);

      const formData = new URLSearchParams();
      formData.append("email", req.email);
      formData.append("password", req.password);
      formData.append("country_id", countryId);
      formData.append("currency", req.currency);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=create_user`;
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "api_key": syntelliCoreApiKey() },
        body: formData,
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw APIError.internal("Invalid response format from registration service");
      }

      if (data.success === false || data.error) {
        const errorMessage = data.info?.message || data.error || "Registration failed";
        if (errorMessage.toLowerCase().includes("email exists")) {
          throw APIError.alreadyExists("User with this email already exists");
        }
        if (errorMessage.toLowerCase().includes("password")) {
          throw APIError.invalidArgument("Password must meet requirements");
        }
        throw APIError.invalidArgument(errorMessage);
      }

      // If registration was successful, perform auto-login
      console.log("Registration successful, performing auto-login...");
      const loginData = await performLogin(req.email, req.password);

      // 🔒 Create secure cookie with JWT (not password!)
      const loginCookie: Cookie<"login_token"> = {
        value: loginData.jwt,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
      };

      const successResponse = {
        jwt: loginData.jwt,
        message: "User registered and logged in successfully",
        user: loginData.user,
        access_token: loginData.access_token,
        success: true,
        loginCookie, // ⬅️ Now included in response
      };

      console.log("Final response:", JSON.stringify(successResponse, null, 2));
      return successResponse;

    } catch (error: any) {
      console.log("=== SYNTELLICORE REGISTER API ERROR ===");
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal("Registration service unavailable");
    }
  }
);
