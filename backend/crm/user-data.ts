import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

// Configuration for Syntellicore CRM
const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

// Interface for user data structure from CRM
export interface UserData {
  fname: string;
  mname: string;
  lname: string;
  registration_dt: string;
  registration_ts: string;
  country_id: string;
  tel1: string;
  tel1_country_code: string;
  tel1_provider_code: string;
  login: string;
  email: string;
  currency: string;
  company: string;
  customer_no: string;
  countryName: string;
  city: string;
  address: string;
  province: string;
  zip: string;
  birthday: string;
  tel_pass: string;
  assign_to: string;
  sales_status: string;
  account_status: string;
  customer_rating: string;
  image_portrait: string;
  image_base64: string;
  status_id: string;
  status_approved: string;
  is_ib: string;
  brand_id: string;
  tag: string;
  lead_method: string;
  extended_fields: any;
  introducer: string;
  fin_exp_verify: string;
  documents_verify: string;
  email_verify: string;
  tc_confirmed: string;
  ni: string;
  identification: string;
}

export interface GetUserDataRequest {
  user: string;
  access_token: string;
}

export interface GetUserDataResponse {
  success: boolean;
  userData: UserData;
  message: string;
}

// Retrieves complete user data from Syntellicore CRM
export const getUserData = api<GetUserDataRequest, GetUserDataResponse>(
  { expose: true, method: "POST", path: "/api/user-data" },
  async (req) => {
    // Validate required authentication parameters
    if (!req.user || !req.access_token) {
      throw APIError.unauthenticated("User and access token are required");
    }

    try {
      console.log("=== SYNTELLICORE GET USER DATA API REQUEST ===");
      console.log("User:", req.user);

      // Prepare form data for CRM user data API
      const formData = new URLSearchParams();
      formData.append("user", req.user);
      formData.append("access_token", req.access_token);

      // Call Syntellicore CRM get_users endpoint
      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=get_users`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== SYNTELLICORE GET USER DATA API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid user credentials");
        }
        throw APIError.internal("Failed to fetch user data from CRM");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from user data service");
      }

      // Validate CRM user data response structure
      if (!data.success || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.log("CRM API returned error or invalid response structure");
        throw APIError.notFound("User data not found or access denied");
      }

      const userData = data.data[0];
      if (!userData.customer_no) {
        console.log("CRM API returned success but missing user data");
        throw APIError.internal("Invalid user data from CRM");
      }

      const successResponse = {
        success: true,
        userData: userData,
        message: data.info?.message || "User data retrieved successfully"
      };

      console.log("User data retrieved successfully for:", userData.customer_no);
      console.log("=== END SYNTELLICORE GET USER DATA API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE GET USER DATA API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Get user data API error:", error);
      throw APIError.internal("User data service unavailable");
    }
  }
);

export interface SetUserDataRequest {
  user: string;
  access_token: string;
  fname?: string;
  lname?: string;
  tel1?: string;
  tel1_country_code?: string;
  cou_id?: string;
  birth_dt?: string;
}

export interface SetUserDataResponse {
  success: boolean;
  message: string;
}

// Updates user data in Syntellicore CRM
export const setUserData = api<SetUserDataRequest, SetUserDataResponse>(
  { expose: true, method: "POST", path: "/api/update-user-data" },
  async (req) => {
    // Validate required authentication parameters
    if (!req.user || !req.access_token) {
      throw APIError.unauthenticated("User and access token are required");
    }

    try {
      console.log("=== SYNTELLICORE SET USER DATA API REQUEST ===");
      console.log("User:", req.user);

      // Prepare form data for CRM user data update API
      const formData = new URLSearchParams();
      formData.append("user", req.user);
      formData.append("access_token", req.access_token);

      // Add optional user data fields if provided
      if (req.fname) formData.append("fname", req.fname);
      if (req.lname) formData.append("lname", req.lname);
      if (req.tel1) formData.append("tel1", req.tel1);
      if (req.tel1_country_code) formData.append("tel1_country_code", req.tel1_country_code);
      if (req.cou_id) formData.append("cou_id", req.cou_id);
      if (req.birth_dt) formData.append("birth_dt", req.birth_dt);

      // Call Syntellicore CRM set_user_data endpoint
      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=set_user_data`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== SYNTELLICORE SET USER DATA API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid user credentials");
        }
        throw APIError.internal("Failed to update user data in CRM");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from user data service");
      }

      // Validate CRM user data update response
      if (!data.success) {
        console.log("CRM API returned error:", data.info?.message || "Unknown error");
        throw APIError.internal("Failed to update user data");
      }

      const successResponse = {
        success: true,
        message: data.info?.message || "User data updated successfully"
      };

      console.log("User data updated successfully for:", req.user);
      console.log("=== END SYNTELLICORE SET USER DATA API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== SYNTELLICORE SET USER DATA API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Set user data API error:", error);
      throw APIError.internal("User data service unavailable");
    }
  }
);
