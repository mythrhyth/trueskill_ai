import { create } from "zustand";
import { api } from "../services/api";

export interface CandidateData {
  skills: Array<{ 
    name: string; 
    conf: number; 
    auth: number; 
    sources: string[]; 
    reasoning: string;
    evidence: string[];
    activeMonths: number;
    repos: number;
  }>;
  radar: Array<{ skill: string; v: number }>;
  activity: Array<{ w: string; commits: number }>;
  breakdown: Array<{ k: string; v: number }>;
  suggestions: Array<{ title: string; desc: string; icon: string }>;
  score: number;
  matchPercentage: number;
  authenticity: number;
  consistency: number;
  scoreReasoning: string;
  matchReasoning: string;
  authenticityReasoning: string;
  consistencyReasoning: string;
  hiringSummary: string;
  strengths: string[];
  weaknesses: string[];
  hireConfidence: number;
  recommendedRoles: string[];
}

export type ProfileStatus = "idle" | "loading" | "success" | "error";

interface ProfileState {
  status: ProfileStatus;
  currentStep: string;
  error: string | null;
  data: CandidateData | null;
  profileUrl: string;

  setProfileUrl: (url: string) => void;
  submitProfile: () => Promise<void>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  status: "idle",
  currentStep: "",
  error: null,
  data: null,
  profileUrl: "",

  setProfileUrl: (url) => set({ profileUrl: url }),

  reset: () => set({ status: "idle", currentStep: "", error: null, data: null, profileUrl: "" }),

  submitProfile: async () => {
    const { profileUrl } = get();
    if (!profileUrl) return;

    set({ status: "loading", error: null, currentStep: "Initializing engine..." });

    try {
      const mockId = "req_" + Math.random().toString(36).substr(2, 9);

      set({ currentStep: "Extracting skills from profile..." });
      await api.extractSkills(profileUrl);

      set({ currentStep: "Validating authenticity against sources..." });
      await api.validateSkills(mockId);

      set({ currentStep: "Building skill graph connections..." });
      // Minor extra delay for visual effect
      await new Promise(res => setTimeout(res, 800));

      set({ currentStep: "Computing credibility score..." });
      await api.calculateScore(mockId);

      set({ currentStep: "Generating recruiter insights & matches..." });
      await api.generateMatches(mockId);

      // Final retrieval of computed data
      const data = api.getMockData();
      
      // Allow user to read the final message briefly before transitioning
      set({ currentStep: "Analysis complete! Preparing dashboard..." });
      await new Promise(res => setTimeout(res, 600));

      set({ status: "success", data, currentStep: "" });

    } catch (err: any) {
      set({ 
        status: "error", 
        error: err?.message || "Failed to analyze profile. Please try again." 
      });
    }
  },
}));
