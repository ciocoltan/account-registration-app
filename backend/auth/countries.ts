import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

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

export interface GetCountriesResponse {
  countries: Country[];
}

// Gets list of available countries from Syntellicore API.
export const getCountries = api<void, GetCountriesResponse>(
  { expose: true, method: "GET", path: "/api/countries" },
  async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('language', 'en');
      formData.append('show_on_register', '1');

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=get_countries`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      // Log the API request details
      console.log("=== SYNTELLICORE GET COUNTRIES API REQUEST ===");
      console.log("URL:", requestUrl);
      console.log("Method: POST");
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));
      console.log("Raw FormData string:", formData.toString());

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      // Log the response details
      console.log("=== SYNTELLICORE GET COUNTRIES API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      
      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        throw APIError.internal("Failed to fetch countries");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        //console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from countries service");
      }
      
      const countries = data.data || [];
      
      const successResponse = {
        countries: Array.isArray(countries) ? countries : []
      };

      console.log("Final response:", JSON.stringify(successResponse, null, 2));
      console.log("=== END SYNTELLICORE GET COUNTRIES API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE GET COUNTRIES API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error.code) {
        throw error; // Re-throw APIError
      }
      console.error("Get countries API error:", error);
      throw APIError.internal("Countries service unavailable");
    }
  }
);
