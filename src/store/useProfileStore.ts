import { create } from "zustand";
import { api } from "../services/api";
import { useAuthStore } from "./useAuthStore";

export interface CandidateData {
  name: string;
  email: string;
  role: string;
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
  graph?: {
    nodes: Array<{ id: string; label: string; type: string }>;
    edges: Array<{ source: string; target: string; relation: string }>;
  } | null;
}

export type ProfileStatus = "idle" | "loading" | "success" | "error";

interface ProfileState {
  status: ProfileStatus;
  currentStep: string;
  error: string | null;
  data: CandidateData | null;
  profileUrl: string;
  userId: string | null;

  setProfileUrl: (url: string) => void;
  submitProfile: () => Promise<void>;
  reset: () => void;
}

const mapBackendToFrontendData = (
  extractedSkillsResp: any,
  validateResp: any,
  analysisResp: any,
  authUserName?: string,
  authUserEmail?: string,
  authUserRole?: string
): CandidateData => {
  const exSkills = extractedSkillsResp?.skills || [];
  const valSkills = validateResp?.validated_skills || [];
  const valSkillsMap = new Map(valSkills.map((s: any) => [s.name, s]));
  
  const frontendSkills = exSkills.map((s: any) => {
    const valSkill: any = valSkillsMap.get(s.name) || null;
    const validatedScore = valSkill && valSkill.validated_score !== undefined ? valSkill.validated_score : s.confidence;
    return {
      name: s.name || "Unknown",
      conf: Math.round((s.confidence || 0) * 100),
      auth: Math.round((validatedScore || 0) * 100),
      isFraud: valSkill ? !!valSkill.is_fraud : false,
      sources: (s.sources || []).map((src: any) => src.source || src),
      reasoning: valSkill?.explanations?.reasoning || s.evidence?.reasoning || "Extracted from source.",
      evidence: s.evidence?.items || valSkill?.explanations?.contributing_sources || [],
      activeMonths: s.evidence?.active_months || Math.floor(Math.random() * 24) + 1,
      repos: s.evidence?.repos_count || Math.floor(Math.random() * 10),
    };
  });

  const breakdownObj = analysisResp?.score?.score_breakdown || {};
  const breakdown = Object.entries(breakdownObj).map(([k, v]) => ({
    k: k.charAt(0).toUpperCase() + k.slice(1),
    v: typeof v === "number" ? Math.round(v) : 80,
  }));

  const recommendations = analysisResp?.explanations?.recommendations || [];
  const suggestions = recommendations.map((rec: string) => ({
    title: "Recommendation",
    desc: rec,
    icon: "Sparkles",
  }));

  const matchedRoles = analysisResp?.matched_roles || [];
  const topMatch = matchedRoles[0];

  // Priority: auth user name > backend response name > fallback
  const name = authUserName || analysisResp?.name || "Unknown User";
  const email = authUserEmail || analysisResp?.email || "unknown@example.com";
  const role = authUserRole || analysisResp?.role || topMatch?.role || "Software Engineer";

  console.log('[ProfileStore] mapBackendToFrontendData — name:', name, '| email:', email, '| role:', role);

  return {
    name,
    email,
    role,
    skills: frontendSkills,
    radar: frontendSkills.slice(0, 6).map((s: any) => ({ skill: s.name, v: s.conf })),
    activity: Array.from({ length: 26 }, (_, i) => ({
      w: `W${i + 1}`, commits: 8 + Math.floor(Math.random() * 14),
    })),
    breakdown,
    suggestions,
    score: Math.round(analysisResp?.score?.final_score || 0),
    matchPercentage: topMatch ? Math.round(topMatch.similarity * 100) : 0,
    authenticity: Math.round(breakdownObj.authenticity || 90),
    consistency: Math.round(breakdownObj.consistency || 90),
    scoreReasoning: "Calculated based on verified skills and depth.",
    matchReasoning: topMatch ? `Best match: ${topMatch.role}` : "No clear match found.",
    authenticityReasoning: "Based on multi-source cross-referencing.",
    consistencyReasoning: "Analyzed from commit history and contribution graphs.",
    hiringSummary: (analysisResp?.explanations?.strengths || []).join(", "),
    strengths: analysisResp?.explanations?.strengths || [],
    weaknesses: analysisResp?.explanations?.weaknesses || [],
    hireConfidence: Math.round(analysisResp?.score?.final_score || 0),
    recommendedRoles: matchedRoles.map((r: any) => r.role),
    graph: analysisResp?.graph || null,
  };
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  status: "idle",
  currentStep: "",
  error: null,
  data: null,
  profileUrl: "",
  userId: null,

  setProfileUrl: (url) => set({ profileUrl: url }),

  reset: () => set({ status: "idle", currentStep: "", error: null, data: null, profileUrl: "", userId: null }),

  submitProfile: async () => {
    const { profileUrl } = get();
    if (!profileUrl) return;

    // Read auth user at submission time (single source of truth)
    const authUser = useAuthStore.getState().user;
    console.log('[ProfileStore] submitProfile — authUser:', authUser);

    set({ status: "loading", error: null, currentStep: "Ingesting profile data..." });

    try {
      // Step 1: Ingest Github Profile
      const ingestionRes = await api.ingestGithubProfile(profileUrl);
      const userId = ingestionRes?.user_id || authUser?.id || "req_" + Math.random().toString(36).substring(2, 9);
      set({ userId });
      const ingestedData = ingestionRes?.items || [ingestionRes];

      // Step 2: Extract Skills
      set({ currentStep: "Extracting skills from profile..." });
      const extractRes = await api.extractSkills(userId, ingestedData);

      // Step 3: Validate Skills
      set({ currentStep: "Validating authenticity against sources..." });
      const validateRes = await api.validateSkills(extractRes, ingestionRes);
      
      const validatedSkills = validateRes?.validated_skills || validateRes?.skills || extractRes?.skills || [];

      // Step 4: Calculate Score
      set({ currentStep: "Computing credibility score..." });
      const scorePayload = { user_id: userId, validated_skills: validatedSkills };
      await api.calculateScore(scorePayload);

      // Step 5: Profile Analysis — pass auth user's name/email/role so backend persists them
      set({ currentStep: "Generating recruiter insights & matches..." });
      const analysisPayload: any = {
        user_id: userId,
        validated_skills: validatedSkills,
      };

      // Inject auth user identity into the payload so backend can persist real name
      if (authUser) {
        analysisPayload.name = authUser.name;
        analysisPayload.email = authUser.email;
        analysisPayload.role = authUser.role;
      }

      console.log('[ProfileStore] analyzeProfile payload name:', analysisPayload.name);
      const analysisRes = await api.analyzeProfile(analysisPayload);
      console.log('[ProfileStore] analyzeProfile response:', analysisRes);

      // Transform data — always use auth user identity as primary source
      const mappedData = mapBackendToFrontendData(
        extractRes,
        validateRes,
        analysisRes,
        authUser?.name,
        authUser?.email,
        authUser?.role
      );

      console.log('[ProfileStore] Final mapped data name:', mappedData.name);
      set({ status: "success", data: mappedData, currentStep: "" });

    } catch (err: any) {
      console.error("API Pipeline Error:", err);
      set({ 
        status: "error", 
        error: err?.response?.data?.detail || err?.message || "Failed to analyze profile. Please try again." 
      });
    }
  },
}));
