import { api, APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";

export interface IpCountryRequest {
  forwardedFor?: Header<"X-Forwarded-For">;
  realIp?: Header<"X-Real-IP">;
  remoteAddr?: Header<"X-Remote-Addr">;
}

export interface IpCountryResponse {
  country_code: string;
  country_name: string;
  ip: string;
}

// Gets country information based on client IP address.
export const getCountryByIp = api<IpCountryRequest, IpCountryResponse>(
  { expose: true, method: "GET", path: "/api/ip-country" },
  async (req) => {
    try {
      // Try to get the real client IP from various headers
      const clientIp = req.forwardedFor?.split(',')[0]?.trim() || 
                       req.realIp || 
                       req.remoteAddr || 
                       '8.8.8.8'; // Fallback IP for testing

      console.log("=== IP COUNTRY DETECTION ===");
      console.log("Client IP:", clientIp);
      console.log("Headers:", {
        forwardedFor: req.forwardedFor,
        realIp: req.realIp,
        remoteAddr: req.remoteAddr
      });

      // Use a free IP geolocation service
      const response = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode`);
      
      if (!response.ok) {
        console.log("IP API request failed:", response.status);
        throw APIError.internal("Failed to get country from IP");
      }

      const data = await response.json();
      console.log("IP API Response:", JSON.stringify(data, null, 2));

      if (data.status !== 'success') {
        console.log("IP API returned error:", data.message);
        // Fallback to a default country (US)
        return {
          country_code: 'US',
          country_name: 'United States',
          ip: clientIp
        };
      }

      const successResponse = {
        country_code: data.countryCode || 'US',
        country_name: data.country || 'United States',
        ip: clientIp
      };

      console.log("Final IP country response:", JSON.stringify(successResponse, null, 2));
      console.log("=== END IP COUNTRY DETECTION ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== IP COUNTRY DETECTION ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      // Fallback to US if everything fails
      return {
        country_code: 'US',
        country_name: 'United States',
        ip: '0.0.0.0'
      };
    }
  }
);
