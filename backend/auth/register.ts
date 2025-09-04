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

// Registers a new user account.
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/api/register-user" },
  async (req) => {
    // Validate input
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    if (!req.countryCode) {
      throw APIError.invalidArgument("Country code is required");
    }

    try {
      console.log("=== GETTING COUNTRY BY CODE ===");
      console.log("Country Code:", req.countryCode);

      // Get country ID from Syntellicore API
      const countryId = await getCountryIdByCode(req.countryCode);
      console.log("Country ID:", countryId);

      const formData = new URLSearchParams();
      formData.append('email', req.email);
      formData.append('password', req.password);
      formData.append('country_id', countryId);
      formData.append('currency', req.currency);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=create_user`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      // Log the API request details
      console.log("=== SYNTELLICORE REGISTER API REQUEST ===");
      console.log("URL:", requestUrl);
      
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      // Log the response details
      console.log("=== SYNTELLICORE REGISTER API RESPONSE ===");

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from registration service");
      }
      
      // Check if the API returned success: false
      if (data.success === false) {
        console.log("API returned success: false");
        const errorMessage = data.info?.message || "Registration failed";
        
        // Handle specific error cases
        if (errorMessage.toLowerCase().includes('email exists')) {
          throw APIError.alreadyExists("User with this email already exists");
        }
        if (errorMessage.toLowerCase().includes('invalid password length')) {
          throw APIError.invalidArgument("Password must be at least 8 characters long");
        }
        
        // Generic error for other cases
        throw APIError.invalidArgument(errorMessage);
      }

      // Check if the response indicates an error (legacy check)
      if (data.error) {
        console.log("API returned error:", data.error);
        if (data.error.toLowerCase().includes('email') && data.error.toLowerCase().includes('exists')) {
          throw APIError.alreadyExists("User with this email already exists");
        }
        throw APIError.invalidArgument(data.error);
      }

      // If registration was successful, perform auto-login
      console.log("Registration successful, performing auto-login...");
      const loginData = await performLogin(req.email, req.password);
      
      const successResponse = {
        jwt: loginData.jwt,
        message: "User registered and logged in successfully",
        user: loginData.user,
        access_token: loginData.access_token,
        success: true
      };

      console.log("Final response:", JSON.stringify(successResponse, null, 2));
      console.log("=== END SYNTELLICORE REGISTER API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE REGISTER API ERROR ===");
      console.log("Error:", error);
      
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Registration API error:", error);
      throw APIError.internal("Registration service unavailable");
    }
  }
);
