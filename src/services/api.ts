import axios from "axios";

// API Client
const apiClient = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

export const api = {
  ingestGithubProfile: async (url: string) => {
    const response = await apiClient.post("/ingestion/github", { url });
    return response.data;
  },

  extractSkills: async (userId: string, data: any) => {
    const response = await apiClient.post("/skill_extractor/extract", {
      user_id: userId,
      data: data,
    });
    return response.data;
  },

  validateSkills: async (extractedSkills: any, rawEvidence: any) => {
    const response = await apiClient.post("/validation/validate", {
      extracted_skills: extractedSkills,
      raw_evidence: rawEvidence,
      debug: false,
    });
    return response.data;
  },

  calculateScore: async (payload: any) => {
    const response = await apiClient.post("/matching/calculate-score", payload);
    return response.data;
  },

  analyzeProfile: async (payload: any) => {
    const response = await apiClient.post("/matching/profile-analysis", payload);
    return response.data;
  },
};
