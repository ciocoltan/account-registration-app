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
  countries: any[];
  // Secure cookie containing encrypted user credentials for auto-login
  loginCookie: Cookie<"login_creds">;
}

// Gets country ID by ISO country code from Syntellicore CRM countries list
async function getCountryIdByCode(countryCode: string): Promise<string> {
  try {
    console.log("=== GETTING COUNTRY ID BY CODE ===");
    console.log("Country Code:", countryCode);

    // Fetch countries from CRM to find matching country ID
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
      return "3"; // Default fallback country ID
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.log("Failed to parse countries response as JSON:", parseError);
      return "3"; // Default fallback
    }

    // Search for country in CRM response
    const countries = data.data || [];
    
    if (Array.isArray(countries)) {
      const country = countries.find((c: any) => 
        c.iso_alpha2_code === countryCode || 
        c.iso_alpha3_code === countryCode
      );
      
      if (country) {
        console.log("Found matching country:", country.name, "ID:", country.country_id);
        return country.country_id.toString();
      }
    }
    
    console.log("Country not found for code:", countryCode, "using default");
    return "3"; // Default fallback
  } catch (error) {
    console.log("Error getting country ID:", error);
    return "3"; // Default fallback
  }
}

// Performs auto-login after successful registration to get authentication token
async function performAutoLogin(email: string, password: string): Promise<{ jwt: string; user: string; access_token: string }> {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('password', password);

  const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=user_login`;
  const requestHeaders = {
    "api_key": syntelliCoreApiKey(),
  };

  console.log("=== SYNTELLICORE AUTO-LOGIN AFTER REGISTER API REQUEST ===");
  console.log("URL:", requestUrl);
  console.log("Email:", email);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: requestHeaders,
    body: formData,
  });

  const responseText = await response.text();
  console.log("Raw Auto-Login Response Body:", responseText);

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
  
  // Validate auto-login response structure
  if (!data.success || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
    console.log("Auto-login API returned error or invalid response structure");
    throw APIError.internal("Auto-login after registration failed");
  }

  const userData = data.data[0];
  if (!userData.authentication_token || !userData.user) {
    console.log("Auto-login API returned success but missing authentication data");
    throw APIError.internal("Auto-login after registration failed");
  }

  return {
    jwt: userData.authentication_token,
    user: userData.user,
    access_token: userData.authentication_token
  };
}

// Fetches countries list from CRM to return with registration response
async function fetchCountriesList(): Promise<any[]> {
  try {
    console.log("=== FETCHING COUNTRIES LIST FOR REGISTRATION RESPONSE ===");

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
      console.log("Countries API failed, returning empty list");
      return [];
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.log("Failed to parse countries response as JSON:", parseError);
      return [];
    }

    return data.data || [];
  } catch (error) {
    console.log("Error fetching countries list:", error);
    return [];
  }
}

// Registers new user with Syntellicore CRM and performs auto-login
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/api/register" },
  async (req) => {
    // Validate input data
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    // Email pattern validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(req.email)) {
      throw APIError.invalidArgument("Invalid email format");
    }

    // Password pattern validation - at least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(req.password)) {
      throw APIError.invalidArgument("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
    }

    if (!req.countryCode) {
      throw APIError.invalidArgument("Country code is required");
    }

    try {
      console.log("=== STARTING USER REGISTRATION PROCESS ===");
      console.log("Email:", req.email);
      console.log("Country Code:", req.countryCode);
      console.log("Currency:", req.currency);

      // Get country ID from CRM based on detected country code
      const countryId = await getCountryIdByCode(req.countryCode);

      // Prepare form data for CRM user creation
      const formData = new URLSearchParams();
      formData.append("email", req.email);
      formData.append("password", req.password);
      formData.append("country_id", countryId);
      formData.append("currency", req.currency);

      // Create user in Syntellicore CRM
      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=create_user`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("=== SYNTELLICORE CREATE USER API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== SYNTELLICORE CREATE USER API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        throw APIError.internal("User creation failed");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from registration service");
      }

      // Handle CRM registration errors
      if (data.success === false || data.error) {
        const errorMessage = data.info?.message || data.error || "Registration failed";
        console.log("CRM registration error:", errorMessage);
        
        if (errorMessage.toLowerCase().includes("email exists") || 
            errorMessage.toLowerCase().includes("already exists")) {
          throw APIError.alreadyExists("User with this email already exists");
        }
        if (errorMessage.toLowerCase().includes("password")) {
          throw APIError.invalidArgument("Password does not meet requirements");
        }
        throw APIError.invalidArgument(errorMessage);
      }

      // Validate successful registration response
      if (!data.success || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.log("Registration succeeded but invalid response structure");
        throw APIError.internal("Registration completed but response invalid");
      }

      const newUserData = data.data[0];
      if (!newUserData.user) {
        console.log("Registration succeeded but no user ID returned");
        throw APIError.internal("Registration completed but user ID missing");
      }

      console.log("User created successfully:", newUserData.user);

      // Perform auto-login to get authentication token
      console.log("Performing auto-login after registration...");
      const loginData = await performAutoLogin(req.email, req.password);

      // Fetch countries list for frontend
      const countries = await fetchCountriesList();

      // Create encrypted cookie with user credentials for 30-day auto-login
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
        jwt: loginData.jwt,
        message: data.info?.message || "User registered and logged in successfully",
        user: loginData.user,
        access_token: loginData.access_token,
        success: true,
        countries: countries,
        loginCookie,
      };

      console.log("Final registration response:", JSON.stringify({ ...successResponse, loginCookie: "***encrypted***", countries: `${countries.length} countries` }, null, 2));
      console.log("=== END SYNTELLICORE REGISTRATION PROCESS ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE REGISTRATION API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Registration API error:", error);
      throw APIError.internal("Registration service unavailable");
    }
  }
);
