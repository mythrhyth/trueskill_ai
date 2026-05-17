import axios from "axios";
import { CandidateData } from "../store/useProfileStore";

// Mock delays for a realistic loading experience
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const mockCandidateData: CandidateData = {
  skills: [
    { name: "Python", conf: 96, auth: 98, sources: ["GitHub", "LeetCode", "Cert"], reasoning: "High frequency of advanced Python features (decorators, asyncio) detected across 14 repos and verified by 2 certifications.", evidence: ["Used in 14 repositories", "Backend APIs detected", "500+ coding problems solved", "Verified by AWS Certification"], activeMonths: 14, repos: 14 },
    { name: "React", conf: 92, auth: 94, sources: ["GitHub", "Portfolio"], reasoning: "Consistent use of modern hooks, custom hooks, and state management in major portfolio projects.", evidence: ["Used in 8 repositories", "Custom hooks detected", "Complex state management (Zustand/Redux)", "Live portfolio implementations"], activeMonths: 24, repos: 8 },
    { name: "Machine Learning", conf: 88, auth: 90, sources: ["Kaggle", "GitHub"], reasoning: "Multiple top 10% Kaggle finishes and well-structured Jupyter notebooks demonstrating deep learning.", evidence: ["Used in 5 repositories", "Top 10% Kaggle finishes", "PyTorch/TensorFlow deep learning models", "Data visualization notebooks"], activeMonths: 10, repos: 5 },
    { name: "DSA", conf: 85, auth: 96, sources: ["LeetCode", "Codeforces"], reasoning: "Consistently solves hard tier problems in LeetCode contests within 30 minutes.", evidence: ["LeetCode Knight ranking", "Hard problems solved < 30m", "Codeforces Expert tier", "Consistent weekly contest participation"], activeMonths: 36, repos: 0 },
    { name: "SQL", conf: 80, auth: 88, sources: ["Cert", "GitHub"], reasoning: "Complex window functions and CTEs observed in data processing pipelines.", evidence: ["Used in 6 repositories", "Complex CTEs and Window Functions", "PostgreSQL/MySQL usage", "Data engineering pipelines"], activeMonths: 18, repos: 6 },
    { name: "FastAPI", conf: 78, auth: 84, sources: ["GitHub"], reasoning: "Used as the primary backend framework for 3 microservices with properly typed endpoints.", evidence: ["Used in 3 repositories", "Production microservices", "Pydantic validation models", "Async endpoint implementations"], activeMonths: 8, repos: 3 },
    { name: "Docker", conf: 72, auth: 80, sources: ["GitHub", "Cert"], reasoning: "Standard multi-stage Dockerfiles present, but lacks orchestration (k8s) experience.", evidence: ["Used in 7 repositories", "Multi-stage builds", "Docker Compose environments", "CI/CD integration pipelines"], activeMonths: 12, repos: 7 },
  ],
  radar: [
    { skill: "Backend", v: 92 }, { skill: "DSA", v: 85 }, { skill: "ML", v: 88 },
    { skill: "DevOps", v: 65 }, { skill: "System Design", v: 78 }, { skill: "Frontend", v: 82 },
  ],
  activity: Array.from({ length: 26 }, (_, i) => ({
    w: `W${i + 1}`, commits: 8 + Math.round(Math.sin(i / 2) * 6 + Math.random() * 14),
  })),
  breakdown: [
    { k: "Depth", v: 88 }, { k: "Authenticity", v: 97 },
    { k: "Diversity", v: 76 }, { k: "Consistency", v: 91 },
  ],
  suggestions: [
    { title: "Improve cloud deployment", desc: "Add 1–2 production deployments on AWS or GCP.", icon: "Cpu" },
    { title: "Build scalable backend projects", desc: "Microservices with messaging (Kafka/Redis).", icon: "Code2" },
    { title: "Increase hard-level DSA solving", desc: "Target 30+ hard problems in 60 days.", icon: "Trophy" },
    { title: "Production-grade APIs", desc: "Add rate limiting, observability, OpenAPI specs.", icon: "ShieldCheck" },
  ],
  score: 92,
  matchPercentage: 88,
  authenticity: 97,
  consistency: 91,
  scoreReasoning: "Backend score increased due to highly consistent API projects and complex SQL usage.",
  matchReasoning: "Strong match for Senior Backend role. Minor gap in DevOps/k8s orchestration.",
  authenticityReasoning: "Authenticity is extremely high because Python and DSA skills appear consistently across GitHub commits, LeetCode contest rankings, and verified certifications.",
  consistencyReasoning: "Commits are well-distributed over the last 26 weeks, with no major gaps longer than 4 days.",
  hiringSummary: "Strong backend-focused candidate with verified Python expertise, scalable API experience, and consistent coding activity. Ready for senior technical roles.",
  strengths: ["Advanced Python & Async IO", "High coding consistency", "Algorithmic problem solving", "Production API design"],
  weaknesses: ["Lacks Kubernetes/Orchestration", "Limited frontend state management"],
  hireConfidence: 94,
  recommendedRoles: ["Senior Backend Engineer", "Data Engineer", "Machine Learning Engineer"],
};

// API Client
const apiClient = axios.create({
  baseURL: "/api/v1", // For future actual backend
  timeout: 10000,
});

export const api = {
  extractSkills: async (profileUrl: string) => {
    // In a real app: return await apiClient.post('/extract', { url: profileUrl });
    await delay(1200); // Simulate network latency
    return { success: true };
  },

  validateSkills: async (profileId: string) => {
    await delay(1500);
    return { success: true };
  },

  calculateScore: async (profileId: string) => {
    await delay(1000);
    return { success: true };
  },

  generateMatches: async (profileId: string) => {
    await delay(1400);
    return { success: true };
  },

  analyzeProfile: async (url: string): Promise<CandidateData> => {
    // This is the combined endpoint if needed, but we use sequential calls above for animation
    await delay(1000);
    return mockCandidateData;
  },

  getMockData: () => {
    return mockCandidateData;
  }
};
