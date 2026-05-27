import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui-kit/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Briefcase,
  MapPin,
  Sparkles,
  ArrowRight,
  Check,
  Plus,
  Loader2,
  AlertCircle,
  User,
  GraduationCap,
} from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { api } from "@/services/api";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Job Matching — TrueSkill AI" }] }),
  component: JobsPage,
});

interface JobRecommendation {
  title: string;
  company: string;
  location: string;
  match: number;
  required: string[];
  strengths: string[];
  missing: string[];
  learn: string;
  explain: string;
}

interface CandidateItem {
  candidate_id: string;
  name: string;
  score: number;
  top_skills: string[];
}

interface CustomMatchResult {
  compatibility_score: number;
  matching_skills: string[];
  missing_skills: string[];
  reasoning_summary: string;
  learning_suggestions: string[];
}

function JobsPage() {
  const { userId } = useProfileStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roles, setRoles] = useState<JobRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Candidates list for fallback selector when not launched from dashboard analysis
  const [candidatesList, setCandidatesList] = useState<CandidateItem[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);

  // Custom Match state
  const [isCustomMatchOpen, setIsCustomMatchOpen] = useState(false);
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [isCustomMatching, setIsCustomMatching] = useState(false);
  const [customMatchResult, setCustomMatchResult] = useState<CustomMatchResult | null>(null);
  const [customMatchError, setCustomMatchError] = useState<string | null>(null);

  // Load candidate list if no active userId in Zustand
  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
      return;
    }

    let isMounted = true;
    setLoadingCandidates(true);
    setCandidatesError(null);

    api.getCandidates()
      .then((data) => {
        if (isMounted) {
          const mappedList = (data || []).map((c: any) => ({
            candidate_id: c.candidate_id,
            name: c.name || "Unknown Candidate",
            score: Math.round((c.score || 0) * 10),
            top_skills: c.top_skills || [],
          }));
          setCandidatesList(mappedList);
          setLoadingCandidates(false);
          // Auto-select the first candidate if available
          if (mappedList.length > 0) {
            setSelectedUserId(mappedList[0].candidate_id);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch candidates:", err);
          setCandidatesError("Failed to load candidate database. Please ensure FastAPI is running.");
          setLoadingCandidates(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Fetch job recommendations dynamically when active selected candidate ID changes
  useEffect(() => {
    if (!selectedUserId) {
      setRoles([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    api.getJobRecommendations(selectedUserId)
      .then((data) => {
        if (isMounted) {
          setRoles(data.recommended_roles || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch jobs:", err);
          setError("Failed to load job recommendations from live backend. Please ensure the service is running.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUserId]);

  const handleCustomMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !customJobDescription.trim()) return;

    setIsCustomMatching(true);
    setCustomMatchError(null);
    setCustomMatchResult(null);

    try {
      const data = await api.customMatch(selectedUserId, customJobDescription);
      setCustomMatchResult({
        compatibility_score: data.compatibility_score || 0.0,
        matching_skills: data.matching_skills || [],
        missing_skills: data.missing_skills || [],
        reasoning_summary: data.reasoning_summary || "",
        learning_suggestions: data.learning_suggestions || [],
      });
    } catch (err) {
      console.error("Custom matching failed:", err);
      setCustomMatchError("Failed to calculate custom job match compatibility. Please try again.");
    } finally {
      setIsCustomMatching(false);
    }
  };

  const activeCandidate = candidatesList.find((c) => c.candidate_id === selectedUserId);
  const activeCandidateName = userId ? "Current Analysis Profile" : (activeCandidate?.name || "Selected Profile");

  // If there is no active analysis in Zustand AND no candidates exist in the SQLite database
  if (!userId && !loadingCandidates && candidatesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center min-h-[60vh]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--indigo)]/10 text-[var(--indigo)] mb-6 animate-pulse">
          <Briefcase className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">No Profile Analyzed Yet</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Please run an analysis from the dashboard first or submit a candidate to populate the talent database and fetch role matches.
        </p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 shadow-lg hover:scale-105 duration-200">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Job Intelligence"
        title="Roles tailored to your verified strengths"
        description="Match scores, capability gaps, and AI-driven learning paths dynamically calculated from your skill profile."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Fallback Candidate Profile Selector dropdown */}
            {!userId && candidatesList.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border bg-card/50 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                <User className="h-4 w-4 text-[var(--indigo)]" />
                <span className="text-xs font-semibold text-muted-foreground mr-1">Talent profile:</span>
                <select
                  value={selectedUserId || ""}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer pr-2"
                >
                  {candidatesList.map((c) => (
                    <option key={c.candidate_id} value={c.candidate_id} className="bg-card text-foreground">
                      {c.name} (TrueSkill: {c.score})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedUserId && (
              <Button
                onClick={() => {
                  setCustomJobDescription("");
                  setCustomMatchResult(null);
                  setCustomMatchError(null);
                  setIsCustomMatchOpen(true);
                }}
                size="sm"
                className="gradient-primary text-white border-0 shadow-md hover:opacity-90 font-bold transition-all hover:scale-105 duration-200"
              >
                <Plus className="mr-2 h-4 w-4" /> Custom Job Match
              </Button>
            )}
          </div>
        }
      />

      {/* Loader for candidate list */}
      {loadingCandidates && (
        <div className="flex justify-center p-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--indigo)]" />
            <p className="text-xs text-muted-foreground">Initializing candidate database...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {candidatesError && (
        <div className="mx-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm font-medium text-destructive-foreground">{candidatesError}</p>
          </div>
        </div>
      )}

      {/* Main Roles Display */}
      {selectedUserId && (
        <div className="p-6 space-y-6">
          {/* Active Profile Info Banner */}
          <div className="rounded-2xl border border-[var(--indigo)]/10 bg-gradient-to-r from-[var(--indigo)]/5 to-[var(--purple)]/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4.5 w-4.5 text-[var(--indigo)]" />
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Evaluating Matching Engine</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  Showing job matches for: <span className="gradient-text font-bold">{activeCandidateName}</span>
                </p>
              </div>
            </div>
            {activeCandidate && (
              <div className="flex gap-1.5 flex-wrap">
                {activeCandidate.top_skills.slice(0, 3).map((s) => (
                  <Badge key={s} variant="outline" className="text-[10px] bg-card/60">{s}</Badge>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--indigo)]" />
            </div>
          ) : error ? (
            <div className="py-20 text-center text-destructive">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <Briefcase className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>No job recommendations generated by backend matching model.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {roles.map((r, i) => (
                <motion.div
                  key={r.title + i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-6 elegant-shadow transition-all duration-300 hover:border-[var(--indigo)]/40 hover:shadow-lg hover:shadow-[var(--indigo)]/5"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[var(--indigo)]/5 blur-3xl" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-1.5 flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white shadow-sm">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-[var(--indigo)] transition-colors">{r.title}</p>
                          <p className="text-xs text-muted-foreground font-semibold">{r.company}</p>
                        </div>
                      </div>
                      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <MapPin className="h-3.5 w-3.5" />{r.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black gradient-text tracking-tight">{Math.round(r.match)}%</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Match</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.match}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full rounded-full gradient-primary"
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Required Skills & Match</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(r.required || []).map((s) => {
                          const isStrength = (r.strengths || []).some(strength => strength.toLowerCase().includes(s.toLowerCase()));
                          return (
                            <Badge
                              key={s}
                              variant={isStrength ? "default" : "outline"}
                              className={isStrength ? "bg-[var(--success)]/15 text-[var(--success)] border-0 font-semibold" : "bg-card/50"}
                            >
                              {isStrength && <Check className="mr-1 h-3 w-3 inline" />}
                              {s}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Skill Gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(r.missing || []).length > 0 ? (
                          r.missing.map((s) => (
                            <Badge key={s} variant="outline" className="border-[var(--warning)]/30 text-[var(--warning)] bg-[var(--warning)]/5 font-semibold">
                              {s}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-[var(--success)] flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> No skill gaps identified!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border bg-gradient-to-br from-[var(--indigo)]/5 to-[var(--purple)]/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[var(--purple)]" />
                      <p className="text-xs font-bold uppercase tracking-wider text-foreground">AI Intelligence & Gaps Reasoning</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.explain}</p>
                    <div className="mt-3 pt-3 border-t flex items-start gap-2">
                      <GraduationCap className="h-4 w-4 text-[var(--indigo)] shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed">
                        <span className="font-bold text-foreground">Next Learning Milestones: </span>
                        <span className="text-muted-foreground">{r.learn}</span>
                      </p>
                    </div>
                  </div>

                  <Button size="sm" variant="ghost" className="mt-5 w-full justify-between group-hover:bg-muted/50 border hover:border-transparent font-bold">
                    View complete role details <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Match Dialog */}
      <Dialog open={isCustomMatchOpen} onOpenChange={setIsCustomMatchOpen}>
        <DialogContent className="max-w-2xl bg-card border elegant-shadow animate-fade-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="h-5 w-5 text-[var(--indigo)]" />
              Custom AI Job Description Matching
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Paste any custom job description. The AI engine will dynamically calculate your match compatibility, find validated overlap skills, detect gaps, and map out a learning checklist.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCustomMatchSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Description Details</label>
              <Textarea
                value={customJobDescription}
                onChange={(e) => setCustomJobDescription(e.target.value)}
                placeholder="Example: We are looking for a Senior Python Developer with 3+ years experience building APIs with FastAPI or Flask. Deep database design using PostgreSQL, SQL optimization, and Docker deployment pipelines are required. Knowledge of Kubernetes is a plus..."
                className="h-40 bg-muted/30 border-0 focus:ring-1 focus:ring-[var(--indigo)] outline-none rounded-xl text-sm leading-relaxed p-4"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsCustomMatchOpen(false)} className="rounded-xl font-bold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCustomMatching || !customJobDescription.trim()}
                className="gradient-primary text-white border-0 font-bold rounded-xl shadow-md transition-all hover:scale-102"
              >
                {isCustomMatching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Custom Matching...
                  </>
                ) : (
                  "Calculate Compatibility"
                )}
              </Button>
            </div>
          </form>

          {/* Custom Matching Result display */}
          {customMatchResult && (
            <div className="mt-6 border-t pt-5 space-y-5 max-h-[50vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-br from-[var(--indigo)]/10 to-[var(--purple)]/10 border border-[var(--indigo)]/15">
                <div>
                  <h3 className="font-bold text-foreground">Custom Fit Capability Analysis</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Calculated using verified skills overlap</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-4xl font-black gradient-text tracking-tighter">{Math.round(customMatchResult.compatibility_score)}%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compatibility</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Matching Strengths</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {customMatchResult.matching_skills.length > 0 ? (
                        customMatchResult.matching_skills.map((s) => (
                          <Badge key={s} className="bg-[var(--success)]/15 text-[var(--success)] border-0 font-semibold text-xs">
                            <Check className="mr-1 h-3 w-3 inline" /> {s}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium italic">No verified matching skills found.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Technical Skill Gaps</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {customMatchResult.missing_skills.length > 0 ? (
                        customMatchResult.missing_skills.map((s) => (
                          <Badge key={s} variant="outline" className="border-[var(--warning)]/30 text-[var(--warning)] bg-[var(--warning)]/5 font-semibold text-xs">
                            {s}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--success)] font-bold flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> No capability gaps identified!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--purple)]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">AI Overlay Reasoning</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {customMatchResult.reasoning_summary}
                  </p>
                </div>

                {customMatchResult.learning_suggestions.length > 0 && (
                  <div className="rounded-xl border bg-card p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4.5 w-4.5 text-[var(--indigo)]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Recommended Learning Checklist</h4>
                    </div>
                    <ul className="space-y-1.5 pl-1">
                      {customMatchResult.learning_suggestions.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--indigo)]/10 text-[var(--indigo)] font-bold text-[9px] mt-0.5">{idx + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom match error state */}
          {customMatchError && (
            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
              <AlertCircle className="h-4.5 w-4.5 text-destructive shrink-0" />
              <p className="text-xs font-medium text-destructive-foreground">{customMatchError}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
