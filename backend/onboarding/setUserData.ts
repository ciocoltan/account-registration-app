import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

const syntelliCoreUrl = secret("SyntelliCoreUrl");
const syntelliCoreApiKey = secret("SyntelliCoreApiKey");

export interface SetUserDataRequest {
  user: string;
  access_token: string;
  fname: string;
  lname: string;
  tel1: string;
  tel1_country_code: string;
  cou_id: string;
  birth_dt: string; // YYYY/DD/MM
}

export interface SetUserDataResponse {
  success: boolean;
  message: string;
}

// Sets user data in Syntellicore.
export const setUserData = api<SetUserDataRequest, SetUserDataResponse>(
  { expose: true, method: "POST", path: "/api/onboarding/set-user-data" },
  async (req) => {
    try {
      const formData = new URLSearchParams();
      formData.append('user', req.user);
      formData.append('access_token', req.access_token);
      formData.append('fname', req.fname);
      formData.append('lname', req.lname);
      formData.append('tel1', req.tel1);
      formData.append('tel1_country_code', req.tel1_country_code);
      formData.append('cou_id', req.cou_id);
      formData.append('birth_dt', req.birth_dt);

      const requestUrl = `${syntelliCoreUrl()}/gateway/api/6/syntellicore.cfc?method=set_user_data`;
      const requestHeaders = {
        "api_key": syntelliCoreApiKey(),
      };

      console.log("=== SYNTELLICORE SET USER DATA API REQUEST ===");
      console.log("URL:", requestUrl);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== SYNTELLICORE SET USER DATA API RESPONSE ===");

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        throw APIError.internal("Failed to set user data");
      }

      const data = JSON.parse(responseText);
      if (!data.success) {
        throw APIError.invalidArgument(data.info?.message || "Failed to set user data");
      }

      return {
        success: true,
        message: "User data saved successfully",
      };
    } catch (error: any) {
      console.error("Set user data API error:", error);
      if (error.code) {
        throw error;
      }
      throw APIError.internal("Set user data service unavailable");
    }
  }
);
