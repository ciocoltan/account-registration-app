import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

// Configuration for Syntellicore CRM
const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

// Interface for country data structure from CRM
export interface Country {
  country_id: number;
  name: string;
  iso_alpha2_code: string;
  iso_alpha3_code: string;
  tel_country_code: string;
  show_on_register: number;
  currency: string;
  currency_id: number;
  brand_id: number;
  zone: string;
}

export interface GetCountriesRequest {
  language?: string;
  show_on_register?: string;
}

export interface GetCountriesResponse {
  success: boolean;
  countries: Country[];
  message: string;
}

// Retrieves countries list from Syntellicore CRM for registration and address forms
export const getCountries = api<GetCountriesRequest, GetCountriesResponse>(
  { expose: true, method: "POST", path: "/api/countries" },
  async (req) => {
    try {
      // Prepare form data for CRM API call
      const formData = new URLSearchParams();
      formData.append('language', req.language || 'en');
      formData.append('show_on_register', req.show_on_register || '1');

      // Make request to Syntellicore CRM get_countries endpoint
      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=get_countries`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("=== SYNTELLICORE GET COUNTRIES API REQUEST ===");
      console.log("URL:", requestUrl);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== SYNTELLICORE GET COUNTRIES API RESPONSE ===");
      console.log("Status:", response.status);
			
      const responseText = await response.text();

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        throw APIError.internal("Failed to fetch countries from CRM");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from countries service");
      }

      // Validate CRM response structure
      if (!data.success || !data.data || !Array.isArray(data.data)) {
        console.log("CRM API returned error or invalid response structure");
        throw APIError.internal("Invalid countries data from CRM");
      }

      const successResponse = {
        success: true,
        countries: data.data,
        message: data.info?.message || "Countries retrieved successfully"
      };

      console.log("Final response:", JSON.stringify(successResponse, null, 2));
      console.log("=== END SYNTELLICORE GET COUNTRIES API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE GET COUNTRIES API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Get countries API error:", error);
      throw APIError.internal("Countries service unavailable");
    }
  }
);
