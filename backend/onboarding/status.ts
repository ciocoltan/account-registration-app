import { api } from "encore.dev/api";

export interface OnboardingStatusResponse {
  userCurrentStep: number;
}

// Retrieves the current onboarding step for the user.
export const getStatus = api<void, OnboardingStatusResponse>(
  { expose: true, method: "GET", path: "/api/onboarding/status" },
  async () => {
    // Mock implementation - in a real app, this would check the user's progress
    return {
      userCurrentStep: 1
    };
  }
);
