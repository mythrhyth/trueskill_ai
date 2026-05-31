import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, StatCard } from "@/components/ui-kit/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Download, FileText, Sparkles, AlertCircle, RefreshCcw, Heart, ChevronLeft, ChevronRight, X, MapPin, Clock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";

export const Route = createFileRoute("/recruiter")({
  head: () => ({ meta: [{ title: "Recruiter Dashboard — TrueSkill AI" }] }),
  component: RecruiterDashboard,
});

type Candidate = {
  id: string;
  name: string;
  email: string;
  role: string;
  score: number;
  auth: number;
  match: number;
  skills: string[];
  rec: string;
  avatar: string;
  location: string;
  experience: string;
  noticePeriod: string;
  elevatorPitch: string;
  photos: string[];
  insights: string[];
  likesCount: number;
  analysisSummary?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    location?: string;
    experience?: string;
    notice_period?: string;
    elevator_pitch?: string;
    photos?: string[];
    likes_count?: number;
  } | null;
};

const PRE_SEEDED_CANDIDATES: Candidate[] = [
  {
    id: "req_gxa8gk7",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    role: "Lead Data Scientist",
    score: 89,
    auth: 91,
    match: 88,
    skills: ["Python", "PyTorch", "SQL", "Pandas", "Scikit-Learn", "TensorFlow"],
    rec: "Lead Data Scientist",
    avatar: "SJ",
    location: "London, UK",
    experience: "7+ years",
    noticePeriod: "1 Month Notice",
    elevatorPitch: "Hello, I'm Sarah. I specialize in bringing machine learning models from research into production. Over the past 7 years, I have worked with retail and logistics companies to build predictive analytics models, demand forecasting systems, and search recommendation algorithms. I enjoy translating complex business data into actionable product features.",
    photos: ["/photos/sarah_jenkins_1.png", "/photos/sarah_jenkins_2.png"],
    insights: [
      "Proven record of deploying machine learning models into live production environments.",
      "Expertise in predictive forecasting and recommendation algorithms.",
      "Strong mathematical foundation in statistical modeling."
    ],
    likesCount: 28,
    analysisSummary: {
      strengths: [
        "Proven record of deploying machine learning models into live production environments.",
        "Expertise in predictive forecasting and recommendation algorithms.",
        "Strong mathematical foundation in statistical modeling."
      ],
      weaknesses: [
        "Less experience in frontend dashboard design.",
        "Prefers standardizing on PyTorch rather than proprietary toolkits."
      ],
      recommendations: [
        "Highly recommended for senior ML and data leadership positions."
      ]
    }
  },
  {
    id: "req_m23levx",
    name: "Shanti Priya",
    email: "shanti.priya@example.com",
    role: "Senior QA Analyst",
    score: 94,
    auth: 96,
    match: 92,
    skills: ["Java", "Python", "Selenium", "JavaScript", "JIRA", "API Testing"],
    rec: "Senior QA Analyst",
    avatar: "SP",
    location: "New Delhi, India",
    experience: "10+ years",
    noticePeriod: "Available Now",
    elevatorPitch: "Hi, I'm Shanti Priya. I hold a Bachelor's degree in Computer Applications from Delhi University, completed in 2012. I've worked as a QA Analyst in the fintech sector for over 10 years, specializing in end-to-end functional testing, regression suites, and automation scripting. My key skills include Selenium, JIRA, API testing, Agile methodology, and defect lifecycle management. I'm ISTQB certified and now eager to contribute to an innovative organization that values precision, speed, and continuous improvement in software delivery.",
    photos: ["/photos/shanti_priya_1.png", "/photos/shanti_priya_2.png"],
    insights: [
      "10+ years of extensive fintech QA experience.",
      "Expertise in automation scripting with Selenium and Playwright.",
      "Strong proficiency in API testing and agile methodologies."
    ],
    likesCount: 33,
    analysisSummary: {
      strengths: [
        "10+ years of extensive fintech QA experience.",
        "Expertise in automation scripting with Selenium and Playwright.",
        "Strong proficiency in API testing and agile methodologies."
      ],
      weaknesses: ["Minimal experience with cloud deployment automation (DevOps)."],
      recommendations: ["Excellent QA lead candidate for compliance-heavy financial systems."]
    }
  },
  {
    id: "req_xcs9nee",
    name: "Aravind Kumar",
    email: "aravind.kumar@example.com",
    role: "Senior Backend Engineer",
    score: 92,
    auth: 95,
    match: 94,
    skills: ["Python", "Django", "PostgreSQL", "Redis", "Docker", "FastAPI"],
    rec: "Senior Backend Engineer",
    avatar: "AK",
    location: "Bangalore, India",
    experience: "6+ years",
    noticePeriod: "Available Now",
    elevatorPitch: "Hi, I'm Aravind. I'm a backend specialist who loves designing scalable APIs, database schemas, and microservices architectures. I have spent the last 6 years building backend systems that handle millions of requests daily, optimizing queries, and setting up CI/CD pipelines. I am passionate about clean code, performance tuning, and robust systems.",
    photos: ["/photos/aravind_kumar_1.png", "/photos/aravind_kumar_2.png"],
    insights: [
      "Strong backend architecture skills with Python and FastAPI/Django.",
      "Significant experience with database tuning and high-concurrency systems.",
      "Highly collaborative developer with strong mentorship experience."
    ],
    likesCount: 19,
    analysisSummary: {
      strengths: [
        "Strong backend architecture skills with Python and FastAPI/Django.",
        "Significant experience with database tuning and high-concurrency systems.",
        "Highly collaborative developer with strong mentorship experience."
      ],
      weaknesses: ["Limited experience building CSS or JavaScript frontend code."],
      recommendations: ["Highly recommended for high-load system design and REST/gRPC API development."]
    }
  },
  {
    id: "req_qf2o6dc",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    role: "Senior Full Stack Engineer",
    score: 87,
    auth: 89,
    match: 90,
    skills: ["React", "Node.js", "TypeScript", "Next.js", "TailwindCSS"],
    rec: "Senior Full Stack Engineer",
    avatar: "ER",
    location: "Prague, Czech Republic",
    experience: "5+ years",
    noticePeriod: "2 Weeks Notice",
    elevatorPitch: "Hello, I'm Elena. I build responsive, accessible, and fast web applications from scratch. With over 5 years of full stack experience, I bridge the gap between pixel-perfect design and backend business logic. I enjoy working on modern web architectures using React and Node.js, and I'm a strong advocate for user-centered UI/UX design.",
    photos: ["/photos/elena_rostova_1.png", "/photos/elena_rostova_2.png"],
    insights: [
      "Exceptional design-to-code implementation fidelity.",
      "Proficient in both frontend states and backend server-side React frameworks.",
      "Active open source contributor to component libraries."
    ],
    likesCount: 15,
    analysisSummary: {
      strengths: [
        "Exceptional design-to-code implementation fidelity.",
        "Proficient in both frontend states and backend server-side React frameworks.",
        "Active open source contributor to component libraries."
      ],
      weaknesses: ["Prefers working in JavaScript/TypeScript environments over Java/C# backend stacks."],
      recommendations: ["Recommended for customer-facing product teams and startup environments."]
    }
  },
  {
    id: "req_88pb5sl",
    name: "Marcus Chen",
    email: "marcus.chen@example.com",
    role: "Lead DevOps Engineer",
    score: 91,
    auth: 93,
    match: 89,
    skills: ["Kubernetes", "Terraform", "AWS", "Docker", "Jenkins", "Go"],
    rec: "Lead DevOps Engineer",
    avatar: "MC",
    location: "San Francisco, CA",
    experience: "8+ years",
    noticePeriod: "3 Months Notice",
    elevatorPitch: "I'm Marcus, an infrastructure engineer who views server management as code. Over the past 8 years, I've designed and managed multi-region cloud infrastructures on AWS, reduced cloud spend by 30%, and automated deployment pipelines for enterprise scale. I specialize in Kubernetes orchestration and GitOps practices.",
    photos: ["/photos/marcus_chen_1.png", "/photos/marcus_chen_2.png"],
    insights: [
      "Extensive experience in infrastructure as code (IaC) and cloud scaling.",
      "Certified Kubernetes Administrator (CKA) with strong container security audit skills.",
      "Proven cost-optimization record saving $100k+ annually."
    ],
    likesCount: 42,
    analysisSummary: {
      strengths: [
        "Extensive experience in infrastructure as code (IaC) and cloud scaling.",
        "Certified Kubernetes Administrator (CKA) with strong container security audit skills.",
        "Proven cost-optimization record saving $100k+ annually."
      ],
      weaknesses: ["Less interest in traditional Windows server administration."],
      recommendations: ["Excellent lead for companies undergoing cloud migration or microservices containerization."]
    }
  },
  {
    id: "req_xlals0e",
    name: "Amara Okafor",
    email: "amara.okafor@example.com",
    role: "Senior Mobile Engineer",
    score: 85,
    auth: 88,
    match: 85,
    skills: ["Swift", "Kotlin", "React Native", "Flutter", "Firebase"],
    rec: "Senior Mobile Engineer",
    avatar: "AO",
    location: "Lagos, Nigeria",
    experience: "4+ years",
    noticePeriod: "Available Now",
    elevatorPitch: "Hi, I'm Amara. I build high-performance mobile experiences for iOS and Android. Over my 4-year career, I have published multiple apps in the App Store and Google Play Store, focused on smooth animations, offline-first syncing, and secure user authentication. I enjoy working in cross-functional agile teams.",
    photos: [
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80"
    ],
    insights: [
      "Published cross-platform apps with 50k+ active installations.",
      "Strong mastery of Swift/Kotlin native bindings.",
      "Excellent understanding of mobile security and caching paradigms."
    ],
    likesCount: 24,
    analysisSummary: {
      strengths: [
        "Published cross-platform apps with 50k+ active installations.",
        "Strong mastery of Swift/Kotlin native bindings.",
        "Excellent understanding of mobile security and caching paradigms."
      ],
      weaknesses: ["Prefers React Native over Flutter for cross-platform applications."],
      recommendations: ["Highly recommended for mobile product development teams in consumer tech."]
    }
  },
  {
    id: "req_7kh7ooa",
    name: "Yuki Tanaka",
    email: "yuki.tanaka@example.com",
    role: "Senior Frontend UI Engineer",
    score: 88,
    auth: 90,
    match: 91,
    skills: ["JavaScript", "CSS/SASS", "Figma", "React", "WebGL", "Three.js"],
    rec: "Senior Frontend UI Engineer",
    avatar: "YT",
    location: "Tokyo, Japan",
    experience: "6+ years",
    noticePeriod: "1 Month Notice",
    elevatorPitch: "Hello, I'm Yuki. I combine engineering with creativity to build immersive, interactive, and beautiful experiences on the web. I have 6 years of experience working closely with design teams to translate interactive wireframes into clean, performant React layouts. I specialize in creative coding, CSS animations, and 3D web graphics.",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
    ],
    insights: [
      "Strong eye for typography, layout, and motion design.",
      "Advanced skills in vector/WebGL animations and SVG morphing.",
      "Expert in semantic markup and WCAG AA accessibility compliance."
    ],
    likesCount: 27,
    analysisSummary: {
      strengths: [
        "Strong eye for typography, layout, and motion design.",
        "Advanced skills in vector/WebGL animations and SVG morphing.",
        "Expert in semantic markup and WCAG AA accessibility compliance."
      ],
      weaknesses: ["Prefers working on UI/design systems rather than backend API endpoints."],
      recommendations: ["Highly recommended for frontend teams working on complex design systems and visualization tools."]
    }
  }
];

function scoreColor(n: number) {
  if (n >= 90) return "text-[var(--success)]";
  if (n >= 80) return "text-[var(--indigo)]";
  return "text-[var(--warning)]";
}

export function getAvatarInitials(name: string | null | undefined): string {
  if (!name || name.trim() === "" || name === "Unknown User" || name === "Unknown Candidate") {
    return "UU";
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  const firstInitial = parts[0][0] || "";
  const lastInitial = parts[parts.length - 1][0] || "";
  return (firstInitial + lastInitial).toUpperCase();
}

/** Returns true when the stored name is just the internal req_* ID */
function isIdName(name: string | undefined | null): boolean {
  if (!name) return true;
  return /^req_[a-z0-9]+$/i.test(name.trim());
}

function getDisplayName(c: any): string {
  if (!isIdName(c.name)) return c.name;
  // Fallback: try email prefix
  if (c.email && !c.email.startsWith('unknown')) {
    return c.email.split('@')[0].split(/[._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  return "Unknown User";
}

function getInitials(name: string): string {
  if (!name || name === "Unknown User") return "UU";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function mapBackendCandidate(c: any): Candidate {
  const scoreBreakdown = c.authenticity_metrics?.score_breakdown || {};
  const topMatch = c.matched_roles?.[0] || {};
  const displayName = getDisplayName(c);
  console.log('[RecruiterDashboard] candidate_id:', c.candidate_id, '| raw name:', c.name, '| display name:', displayName);

  const analysis = c.analysis_summary || {};

  return {
    id: c.candidate_id,
    name: displayName,
    email: c.email || "unknown@example.com",
    role: c.role || topMatch.role || "Software Engineer",
    score: Math.round((c.score || 0) * 10),
    auth: Math.round((scoreBreakdown.authenticity || 9.0) * 10),
    match: Math.round((topMatch.similarity || 0.85) * 100),
    skills: c.top_skills || [],
    rec: topMatch.role || "Software Engineer",
    avatar: getInitials(displayName),
    location: analysis.location || "Location Not Provided",
    experience: analysis.experience || "N/A",
    noticePeriod: analysis.notice_period || "Available Now",
    elevatorPitch: analysis.elevator_pitch || "No about information provided.",
    photos: analysis.photos || [],
    insights: analysis.strengths || [],
    likesCount: analysis.likes_count || 12,
    analysisSummary: c.analysis_summary || null
  };
}

function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Candidate | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [detailData, setDetailData] = useState<any>(null);
  const [openRolesCount, setOpenRolesCount] = useState(0);

  // Custom states for interactive features
  const [likedCandidates, setLikedCandidates] = useState<Record<string, boolean>>({});
  const [shortlistedCandidates, setShortlistedCandidates] = useState<Record<string, boolean>>({});

  const { user } = useAuthStore();

  const toggleLike = (id: string) => {
    setLikedCandidates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleShortlist = (id: string) => {
    setShortlistedCandidates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isLiked = (id: string) => !!likedCandidates[id];
  const isShortlisted = (id: string) => !!shortlistedCandidates[id];

  const handlePrevPhoto = (photos: string[]) => {
    setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (photos: string[]) => {
    setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCandidates();
      if (data && data.length > 0) {
        const mapped = (data || []).map((c: any) => mapBackendCandidate(c));
        setCandidates(mapped);
      } else {
        setCandidates(PRE_SEEDED_CANDIDATES);
      }
    } catch (err: any) {
      console.error("Failed to fetch recruiter candidates:", err);
      setError("Failed to connect to backend candidate database. Falling back to pre-seeded profiles.");
      setCandidates(PRE_SEEDED_CANDIDATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    
    // Fetch live role templates count from backend
    api.getRoleTemplates()
      .then((data) => {
        setOpenRolesCount(data?.length || 0);
      })
      .catch((err) => {
        console.error("Failed to fetch dynamic role templates:", err);
        setOpenRolesCount(4); // Clean fallback to default templates count
      });
  }, []);

  const handleViewDetails = async (cand: Candidate) => {
    setOpen(cand);
    setPhotoIndex(0);
    setDetailData(null);
    try {
      const details = await api.getCandidateById(cand.id);
      setDetailData(details);
    } catch (err) {
      console.error("Failed to fetch candidate details:", err);
      // Fallback is handled by using 'open' object in rendering
    }
  };

  const filtered = candidates.filter(c =>
    `${c.name} ${c.role} ${c.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase())
  );

  // Debug log
  console.log('[RecruiterDashboard] candidates loaded:', candidates.length, '| filtered:', filtered.length);

  // Dynamic statistics calculations based on live database candidates
  const candidateCount = candidates.length;
  const averageTrueSkill = candidateCount > 0 
    ? (candidates.reduce((sum, c) => sum + c.score, 0) / candidateCount).toFixed(1)
    : "0.0";
  const verifiedPercentage = candidateCount > 0
    ? `${Math.round((candidates.filter(c => c.auth >= 80).length / candidateCount) * 100)}%`
    : "100%";

  return (
    <div>
      <PageHeader
        eyebrow={`Recruiter · ${user?.name || 'Northwind Talent'}`}
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Recruiter'}`}
        description="Ranked candidates, verified scores, and AI-powered matching across your active roles."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={fetchCandidates}>
              <RefreshCcw className="mr-2 h-4 w-4" />Refresh
            </Button>
            <Button size="sm" className="gradient-primary text-white border-0">New Search</Button>
          </>
        }
      />

      <div className="space-y-6 p-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Active candidates" value={candidateCount.toString()} hint="Stored in SQLite" accent="indigo" />
          <StatCard label="Avg TrueSkill" value={averageTrueSkill} hint="Across database" accent="purple" />
          <StatCard label="Verified profiles" value={verifiedPercentage} hint="Multi-source" accent="success" />
          <StatCard label="Open roles" value={openRolesCount.toString()} hint="Jobs dashboard" accent="cyan" />
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive-foreground">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchCandidates} className="border-destructive/20 text-destructive hover:bg-destructive/10">
              Retry
            </Button>
          </div>
        )}

        <div className="rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <div className="relative flex-1 min-w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, skill, role..." className="pl-9 bg-muted/30 border-0" />
            </div>
            <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Skills</Button>
            <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Domains</Button>
            <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Score</Button>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-sm text-muted-foreground">Fetching analyzed candidates from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-base font-semibold">No Candidates Found</p>
              <p className="text-sm mt-1">Please submit profiles in the Candidate tab to analyze and populate this list.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">User Name</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Authenticity</th>
                    <th className="px-4 py-3 font-medium">Match %</th>
                    <th className="px-4 py-3 font-medium">Top Skills</th>
                    <th className="px-4 py-3 font-medium">Recommended Role</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="border-b transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-white overflow-hidden shrink-0 border border-muted/10">
                            {c.photos && c.photos.length > 0 ? (
                              <img src={c.photos[0]} alt={c.name} className="h-full w-full object-cover" />
                            ) : (
                              c.avatar
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={`font-semibold ${scoreColor(c.score)}`}>{c.score}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${c.auth}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{c.auth}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full gradient-primary" style={{ width: `${c.match}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{c.match}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.skills.slice(0, 3).map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                          {c.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">{c.rec}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(c)}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl animate-fade-in p-6 overflow-y-auto max-h-[90vh] bg-card text-card-foreground border rounded-3xl shadow-2xl">
          {open && (
            <div className="space-y-6">
              {/* Header section */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-sm font-semibold text-white overflow-hidden shrink-0 border-2 border-indigo-500/20">
                    {open.photos && open.photos.length > 0 ? (
                      <img src={open.photos[0]} alt={open.name} className="h-full w-full object-cover" />
                    ) : (
                      open.avatar
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground leading-tight flex items-center gap-2">
                      {open.name}
                    </h3>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">{open.role}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/75" />
                        {open.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/75" />
                        {open.experience}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {open.noticePeriod}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => toggleLike(open.id)}
                    className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3.5 py-1.5 text-xs font-bold cursor-pointer hover:bg-muted/70 transition shadow-xs"
                  >
                    <Heart className={`h-4.5 w-4.5 transition-colors ${isLiked(open.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                    <span className={isLiked(open.id) ? "text-destructive" : "text-muted-foreground"}>
                      {open.likesCount + (isLiked(open.id) ? 1 : 0)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Tech stack badges */}
              <div className="flex flex-wrap gap-1.5 py-0.5 border-t border-b border-muted/20 my-1">
                {open.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 text-xs font-semibold bg-muted/50 border border-muted/20 text-muted-foreground">
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* Photo Slider */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-black overflow-hidden flex items-center justify-center group shadow-inner border border-muted/20">
                {open.photos && open.photos.length > 0 ? (
                  <>
                    <img
                      src={open.photos[photoIndex]}
                      alt={`${open.name} - Photo ${photoIndex + 1}`}
                      className="h-full w-full object-cover transition-all duration-300"
                    />
                    {open.photos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePrevPhoto(open.photos); }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/80 hover:bg-black/80 hover:text-white transition duration-200 cursor-pointer shadow-lg backdrop-blur-xs"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleNextPhoto(open.photos); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/80 hover:bg-black/80 hover:text-white transition duration-200 cursor-pointer shadow-lg backdrop-blur-xs"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
                          {open.photos.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-2 w-2 rounded-full transition-all ${
                                idx === photoIndex ? "bg-indigo-500 scale-125" : "bg-white/40"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm">No photo portfolio available</p>
                  </div>
                )}
              </div>

              {/* Elevator Pitch */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Elevator Pitch</h4>
                <p className="text-sm text-foreground/90 leading-relaxed font-normal bg-muted/20 p-4 rounded-xl border border-muted/10">
                  {open.elevatorPitch}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border p-4 text-center bg-card shadow-xs border-indigo-500/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TrueSkill</p>
                  <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">{open.score}</p>
                </div>
                <div className="rounded-xl border p-4 text-center bg-card shadow-xs border-emerald-500/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Authenticity</p>
                  <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{open.auth}%</p>
                </div>
                <div className="rounded-xl border p-4 text-center bg-card shadow-xs border-blue-500/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role Match</p>
                  <p className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">{open.match}%</p>
                </div>
              </div>

              {/* AI Insights */}
              <div className="rounded-2xl border bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-5 border-indigo-500/10">
                <div className="mb-3 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-4.5 w-4.5" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">AI Intelligence Insights</h4>
                </div>
                <ul className="space-y-2">
                  {open.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-indigo-500 dark:text-indigo-400 mt-1 shrink-0 font-bold">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button variant="outline" className="flex-1 py-5 border-muted hover:bg-muted/40 font-medium">
                  <FileText className="mr-2 h-4.5 w-4.5" /> Full Report
                </Button>
                <Button
                  onClick={() => toggleShortlist(open.id)}
                  className={`flex-1 py-5 font-semibold transition ${
                    isShortlisted(open.id)
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "gradient-primary hover:opacity-90 text-white border-0"
                  }`}
                >
                  <Heart className={`mr-2 h-4.5 w-4.5 ${isShortlisted(open.id) ? "fill-white" : ""}`} />
                  {isShortlisted(open.id) ? "Shortlisted!" : "Shortlist Candidate"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Temporary internal component for Dialog stat scaling to ensure layout alignment
function DialogCardStat({ label, value, accent }: { label: string; value: string | number; accent: "indigo" | "success" | "purple" }) {
  const colors = {
    indigo: "border-[var(--indigo)]/20 bg-[var(--indigo)]/5 text-[var(--indigo)]",
    success: "border-[var(--success)]/20 bg-[var(--success)]/5 text-[var(--success)]",
    purple: "border-[var(--purple)]/20 bg-[var(--purple)]/5 text-[var(--purple)]",
  };

  return (
    <div className={`rounded-xl border p-4 text-center backdrop-blur-sm ${colors[accent]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
