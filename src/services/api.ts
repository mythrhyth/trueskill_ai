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

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/ingestion/resume-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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

  getCandidates: async () => {
    const response = await apiClient.get("/recruiter/candidates");
    return response.data;
  },

  getCandidateById: async (id: string) => {
    const response = await apiClient.get(`/recruiter/candidate/${id}`);
    return response.data;
  },

  getTopRanked: async () => {
    const response = await apiClient.get("/recruiter/top-ranked");
    return response.data;
  },

  filterCandidates: async (params: { skill?: string; domain?: string; minimum_score?: number }) => {
    const response = await apiClient.get("/recruiter/filter", { params });
    return response.data;
  },

  getJobRecommendations: async (candidateId: string) => {
    const response = await apiClient.get(`/jobs/recommendations/${candidateId}`);
    return response.data;
  },

  getRoleTemplates: async () => {
    const response = await apiClient.get("/jobs/roles");
    return response.data;
  },

  customMatch: async (candidateId: string, jobDescription: string) => {
    const response = await apiClient.post("/jobs/custom-match", {
      candidate_id: candidateId,
      job_description: jobDescription,
    });
    return response.data;
  },
};
