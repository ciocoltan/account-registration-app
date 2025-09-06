import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

// Configuration for Vault Markets CRM
const vaultMarketsUrl = secret("VaultMarketsUrl");
const vaultMarketsApiKey = secret("VaultMarketsApiKey");

// Interface for questionnaire question structure
export interface QuestionnaireQuestion {
  eqaq_id: number;
  name: string;
  title: string;
  category_name: string;
  category_title: string;
  category_order: string;
  publish: string;
  required: string;
  field_type: string;
  question_order: string;
  is_hidden: string;
  max_answer: string;
  answers: QuestionnaireAnswer[];
}

// Interface for questionnaire answer options
export interface QuestionnaireAnswer {
  eqaa_id: number;
  name: string;
  title: string;
  publish: string;
  show_question: string;
  hide_question: string;
}

// Interface for complete questionnaire structure
export interface Questionnaire {
  eqa_id: number;
  name: string;
  title: string;
  publish: string;
  showorder: string;
  questions: QuestionnaireQuestion[];
}

export interface GetQuestionnairesRequest {
  user: string;
  access_token: string;
  eqa_id: string;
}

export interface GetQuestionnairesResponse {
  success: boolean;
  questionnaire: Questionnaire;
  message: string;
}

// Retrieves questionnaire structure from Vault Markets CRM for form building
export const getQuestionnaires = api<GetQuestionnairesRequest, GetQuestionnairesResponse>(
  { expose: true, method: "POST", path: "/api/questionnaires" },
  async (req) => {
    // Validate required authentication parameters
    if (!req.user || !req.access_token) {
      throw APIError.unauthenticated("User and access token are required");
    }

    if (!req.eqa_id) {
      throw APIError.invalidArgument("Questionnaire ID (eqa_id) is required");
    }

    try {
      console.log("=== VAULT MARKETS GET QUESTIONNAIRES API REQUEST ===");
      console.log("User:", req.user);
      console.log("Questionnaire ID:", req.eqa_id);

      // Prepare form data for CRM questionnaires API
      const formData = new URLSearchParams();
      formData.append("user", req.user);
      formData.append("access_token", req.access_token);
      formData.append("eqa_id", req.eqa_id);

      // Call Vault Markets CRM get_questionnaires endpoint
      const requestUrl = `${vaultMarketsUrl()}/gateway/api/6/syntellicore.cfc?method=get_questionnaires`;
      const requestHeaders = {
        "api_key": vaultMarketsApiKey(),
      };

      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== VAULT MARKETS GET QUESTIONNAIRES API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid user credentials");
        }
        throw APIError.internal("Failed to fetch questionnaires from CRM");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from questionnaires service");
      }

      // Validate CRM questionnaires response structure
      if (!data.success || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.log("CRM API returned error or invalid response structure");
        throw APIError.notFound("Questionnaire not found or access denied");
      }

      const questionnaireData = data.data[0];
      if (!questionnaireData.eqa_id) {
        console.log("CRM API returned success but missing questionnaire data");
        throw APIError.internal("Invalid questionnaire data from CRM");
      }

      const successResponse = {
        success: true,
        questionnaire: questionnaireData,
        message: data.info?.message || "Questionnaire retrieved successfully"
      };

      console.log("Questionnaire retrieved successfully:", questionnaireData.name);
      console.log("Questions count:", questionnaireData.questions?.length || 0);
      console.log("=== END VAULT MARKETS GET QUESTIONNAIRES API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== VAULT MARKETS GET QUESTIONNAIRES API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Get questionnaires API error:", error);
      throw APIError.internal("Questionnaires service unavailable");
    }
  }
);

// Interface for user answer submission
export interface UserAnswerSubmission {
  eqaq_id: string;
  eqaa_id?: number;
  eqaa_text: string;
}

export interface SetQuestionnaireUserAnswersRequest {
  user: string;
  access_token: string;
  eqa_multiple_answers: UserAnswerSubmission[];
}

export interface SetQuestionnaireUserAnswersResponse {
  success: boolean;
  message: string;
}

// Submits user answers to questionnaire in Vault Markets CRM
export const setQuestionnaireUserAnswers = api<SetQuestionnaireUserAnswersRequest, SetQuestionnaireUserAnswersResponse>(
  { expose: true, method: "POST", path: "/api/questionnaire-answers" },
  async (req) => {
    // Validate required authentication parameters
    if (!req.user || !req.access_token) {
      throw APIError.unauthenticated("User and access token are required");
    }

    if (!req.eqa_multiple_answers || !Array.isArray(req.eqa_multiple_answers) || req.eqa_multiple_answers.length === 0) {
      throw APIError.invalidArgument("Questionnaire answers are required");
    }

    try {
      console.log("=== VAULT MARKETS SET QUESTIONNAIRE ANSWERS API REQUEST ===");
      console.log("User:", req.user);
      console.log("Answers count:", req.eqa_multiple_answers.length);

      // Prepare form data for CRM questionnaire answers API
      const formData = new URLSearchParams();
      formData.append("user", req.user);
      formData.append("access_token", req.access_token);
      
      // Convert answers array to JSON string as expected by CRM API
      const answersJson = JSON.stringify(req.eqa_multiple_answers);
      formData.append("eqa_multiple_answers", answersJson);

      // Call Vault Markets CRM set_questionnaire_user_answers endpoint
      const requestUrl = `${vaultMarketsUrl()}/gateway/api/6/syntellicore.cfc?method=set_questionnaire_user_answers`;
      const requestHeaders = {
        "api_key": vaultMarketsApiKey(),
      };

      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Answers JSON:", answersJson);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== VAULT MARKETS SET QUESTIONNAIRE ANSWERS API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid user credentials");
        }
        throw APIError.internal("Failed to save questionnaire answers to CRM");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from questionnaire answers service");
      }

      // Validate CRM questionnaire answers response
      if (!data.success) {
        console.log("CRM API returned error:", data.info?.message || "Unknown error");
        throw APIError.internal("Failed to save questionnaire answers");
      }

      const successResponse = {
        success: true,
        message: data.info?.message || "Questionnaire answers saved successfully"
      };

      console.log("Questionnaire answers saved successfully for user:", req.user);
      console.log("=== END VAULT MARKETS SET QUESTIONNAIRE ANSWERS API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== VAULT MARKETS SET QUESTIONNAIRE ANSWERS API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Set questionnaire answers API error:", error);
      throw APIError.internal("Questionnaire answers service unavailable");
    }
  }
);

// Interface for user answer retrieval
export interface UserAnswerData {
  eqa_id: number;
  qa_title: string;
  c_text: string;
  eqaq_id: number;
  q_text: string;
  eqaa_id: string;
  a_text: string;
  multiple_answer: string;
  weight: string;
}

export interface GetQuestionnaireUserAnswersRequest {
  user: string;
  access_token: string;
  eqa_id: string;
}

export interface GetQuestionnaireUserAnswersResponse {
  success: boolean;
  answers: UserAnswerData[];
  message: string;
}

// Retrieves user's saved answers from Vault Markets CRM questionnaire
export const getQuestionnaireUserAnswers = api<GetQuestionnaireUserAnswersRequest, GetQuestionnaireUserAnswersResponse>(
  { expose: true, method: "POST", path: "/api/questionnaire-user-answers" },
  async (req) => {
    // Validate required authentication parameters
    if (!req.user || !req.access_token) {
      throw APIError.unauthenticated("User and access token are required");
    }

    if (!req.eqa_id) {
      throw APIError.invalidArgument("Questionnaire ID (eqa_id) is required");
    }

    try {
      console.log("=== VAULT MARKETS GET QUESTIONNAIRE USER ANSWERS API REQUEST ===");
      console.log("User:", req.user);
      console.log("Questionnaire ID:", req.eqa_id);

      // Prepare form data for CRM user answers API
      const formData = new URLSearchParams();
      formData.append("user", req.user);
      formData.append("access_token", req.access_token);
      formData.append("eqa_id", req.eqa_id);

      // Call Vault Markets CRM get_questionnaire_user_answers endpoint
      const requestUrl = `${vaultMarketsUrl()}/gateway/api/6/syntellicore.cfc?method=get_questionnaire_user_answers`;
      const requestHeaders = {
        "api_key": vaultMarketsApiKey(),
      };

      console.log("URL:", requestUrl);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      console.log("Body (FormData):", Object.fromEntries(formData.entries()));

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      console.log("=== VAULT MARKETS GET QUESTIONNAIRE USER ANSWERS API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const responseText = await response.text();
      console.log("Raw Response Body:", responseText);

      if (!response.ok) {
        console.log("Request failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          throw APIError.unauthenticated("Invalid user credentials");
        }
        throw APIError.internal("Failed to fetch user answers from CRM");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log("Failed to parse response as JSON:", parseError);
        throw APIError.internal("Invalid response format from user answers service");
      }

      // Validate CRM user answers response structure
      if (!data.success) {
        console.log("CRM API returned error:", data.info?.message || "Unknown error");
        throw APIError.internal("Failed to retrieve user answers");
      }

      // Handle case where user has no saved answers yet
      const answers = data.data || [];

      const successResponse = {
        success: true,
        answers: answers,
        message: data.info?.message || "User answers retrieved successfully"
      };

      console.log("User answers retrieved successfully. Count:", answers.length);
      console.log("=== END VAULT MARKETS GET QUESTIONNAIRE USER ANSWERS API ===");

      return successResponse;
    } catch (error: any) {
      console.log("=== VAULT MARKETS GET QUESTIONNAIRE USER ANSWERS API ERROR ===");
      console.log("Error:", error);
      console.log("Error stack:", error.stack);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      console.error("Get questionnaire user answers API error:", error);
      throw APIError.internal("User answers service unavailable");
    }
  }
);
