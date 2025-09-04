import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { Header } from "encore.dev/api";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

export interface RegisterRequest {
  email: string;
  password: string;
  currency: string;
  forwardedFor?: Header<"X-Forwarded-For">;
  realIp?: Header<"X-Real-IP">;
  remoteAddr?: Header<"X-Remote-Addr">;
}

export interface RegisterResponse {
  jwt: string;
  message: string;
  user?: string;
}

// Gets country ID by country code from Syntellicore countries API
async function getCountryIdByCode(countryCode: string): Promise<string> {
  try {
    const formData = new URLSearchParams();
    formData.append('language', 'en');

    const response = await fetch(`${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=get_countries`, {
      method: "POST",
      headers: {
        "api_key": syntelliCoreApiKey(),
      },
      body: formData,
    });

    if (!response.ok) {
      console.log("Countries API failed, using default country ID");
      return "1"; // Default fallback
    }

    const data = await response.json();
    const countries = data.countries || data || [];
    
    if (Array.isArray(countries)) {
      const country = countries.find((c: any) => 
        c.country_code === countryCode || 
        c.code === countryCode ||
        c.iso_code === countryCode
      );
      
      if (country) {
        console.log("Found country:", country);
        return country.country_id || country.id || "1";
      }
    }
    
    console.log("Country not found for code:", countryCode, "using default");
    return "1"; // Default fallback
  } catch (error) {
    console.log("Error getting country ID:", error);
    return "1"; // Default fallback
  }
}

// Gets country by IP using free IP geolocation service
async function getCountryByIp(ip: string): Promise<{ countryCode: string; countryName: string }> {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode`);
    
    if (!response.ok) {
      return { countryCode: 'US', countryName: 'United States' };
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      return { countryCode: 'US', countryName: 'United States' };
    }

    return {
      countryCode: data.countryCode || 'US',
      countryName: data.country || 'United States'
    };
  } catch (error) {
    console.log("IP geolocation error:", error);
    return { countryCode: 'US', countryName: 'United States' };
  }
}

// Registers a new user account.
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/api/register-user" },
  async (req) => {
    // Validate input
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    try {
      // Get client IP
      const clientIp = req.forwardedFor?.split(',')[0]?.trim() || 
                       req.realIp || 
                       req.remoteAddr || 
                       '8.8.8.8'; // Fallback IP for testing

      console.log("=== GETTING COUNTRY BY IP ===");
      console.log("Client IP:", clientIp);

      // Get country by IP
      const ipCountry = await getCountryByIp(clientIp);
      console.log("IP Country:", ipCountry);

      // Get country ID from Syntellicore API
      const countryId = await getCountryIdByCode(ipCountry.countryCode);
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
      console.log("Raw FormData string:", formData.toString());

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      // Log the response details
      console.log("=== SYNTELLICORE REGISTER API RESPONSE ===");

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 409) {
          throw APIError.alreadyExists("User with this email already exists");
        }
        if (response.status === 400) {
          throw APIError.invalidArgument("Invalid registration data");
        }
        throw APIError.internal("Registration failed");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from registration service");
      }
      
      // Check if the response indicates an error
      if (data.error) {
        console.log("API returned error:", data.error);
        if (data.error.toLowerCase().includes('email') && data.error.toLowerCase().includes('exists')) {
          throw APIError.alreadyExists("User with this email already exists");
        }
        throw APIError.invalidArgument(data.error);
      }
      
      // For registration, we might need to do a login call to get the access token
      // or use the returned user data to generate a token
      const mockToken = `registered-${Date.now()}`;
      
      const successResponse = {
        jwt: mockToken,
        message: "User registered successfully",
        user: data.user || data.customer_no
      };

      //console.log("Final response:", JSON.stringify(successResponse, null, 2));
      console.log("=== END SYNTELLICORE REGISTER API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE REGISTER API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Registration API error:", error);
      throw APIError.internal("Registration service unavailable");
    }
  }
);
