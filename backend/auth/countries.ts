import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

// Configuration for Vault Markets CRM
const vaultMarketsUrl = secret("VaultMarketsUrl");
const vaultMarketsApiKey = secret("VaultMarketsApiKey");

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

// Retrieves countries list from Vault Markets CRM for registration and address forms
export const getCountries = api<GetCountriesRequest, GetCountriesResponse>(
  { expose: true, method: "POST", path: "/api/countries" },
  async (req) => {
    try {
      // Prepare form data for CRM API call
      const formData = new URLSearchParams();
      formData.append('language', req.language || 'en');
      formData.append('show_on_register', req.show_on_register || '1');

      // Make request to Vault Markets CRM get_countries endpoint
      const requestUrl = `${vaultMarketsUrl()}/gateway/api/6/syntellicore.cfc?method=get_countries`;
      const requestHeaders = {
        "api_key": vaultMarketsApiKey(),
      };

      console.log("=== VAULT MARKETS GET COUNTRIES API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== VAULT MARKETS GET COUNTRIES API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        throw APIError.internal("Failed to fetch countries from CRM");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
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
      console.log("=== END VAULT MARKETS GET COUNTRIES API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== VAULT MARKETS GET COUNTRIES API ERROR ===");
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
