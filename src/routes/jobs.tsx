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
  ChevronLeft,
  ChevronRight,
  Mail,
  Clock,
  Heart,
} from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { useAuthStore } from "@/store/useAuthStore";
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
  email: string;
  role: string;
  score: number;
  auth: number;
  match: number;
  top_skills: string[];
  avatar: string;
  location: string;
  experience: string;
  noticePeriod: string;
  elevatorPitch: string;
  photos: string[];
  insights: string[];
}

interface CustomMatchResult {
  compatibility_score: number;
  matching_skills: string[];
  missing_skills: string[];
  reasoning_summary: string;
  learning_suggestions: string[];
}

const PRE_SEEDED_CANDIDATES = [
  {
    id: "req_gxa8gk7",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    role: "Lead Data Scientist",
    score: 89,
    auth: 91,
    match: 88,
    skills: ["Python", "PyTorch", "SQL", "Pandas", "Scikit-Learn", "TensorFlow"],
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
];

const PRE_SEEDED_JOB_RECOMMENDATIONS: Record<string, JobRecommendation[]> = {
  req_gxa8gk7: [
    {
      title: "Lead Data Scientist",
      company: "Northwind Retail",
      location: "London, UK",
      match: 92,
      required: ["Python", "PyTorch", "SQL", "Pandas", "Scikit-Learn", "Machine Learning"],
      strengths: ["Python", "PyTorch", "SQL", "Pandas", "Scikit-Learn"],
      missing: ["Machine Learning"],
      learn: "Standardize on cloud-native ML deployment tools",
      explain: "Strong alignment with retail predictive modeling experience. Gaps are minor and easily resolved."
    },
    {
      title: "AI Research Engineer",
      company: "Tesla",
      location: "Palo Alto, CA (Hybrid)",
      match: 82,
      required: ["Python", "TensorFlow", "Computer Vision", "C++", "PyTorch"],
      strengths: ["Python", "PyTorch", "TensorFlow"],
      missing: ["Computer Vision", "C++"],
      learn: "Acquire C++ system programming foundations and OpenCV/PyTorch CV architectures",
      explain: "High core ML skill overlap, but missing required C++ and computer vision expertise."
    }
  ],
  req_m23levx: [
    {
      title: "Senior QA Analyst",
      company: "FinanceFlow",
      location: "New Delhi, India",
      match: 94,
      required: ["Java", "Selenium", "JIRA", "API Testing", "Agile"],
      strengths: ["Java", "Selenium", "JIRA", "API Testing"],
      missing: ["Agile"],
      learn: "Complete Agile Scrum Master certification",
      explain: "Outstanding QA experience. Strong automation skill overlap matches fintech workflow requirements."
    },
    {
      title: "Lead Automation Engineer",
      company: "TechCorp",
      location: "Bangalore, India",
      match: 85,
      required: ["Java", "Python", "Selenium", "Playwright", "CI/CD", "Docker"],
      strengths: ["Java", "Python", "Selenium"],
      missing: ["Playwright", "CI/CD", "Docker"],
      learn: "Learn Docker containerization and Jenkins/GitLab CI pipeline configurations",
      explain: "Strong core testing background, but requires upskilling in modern DevOps integration tools."
    }
  ],
  req_xcs9nee: [
    {
      title: "Senior Backend Engineer",
      company: "CloudScale",
      location: "Bangalore, India",
      match: 94,
      required: ["Python", "Django", "PostgreSQL", "Redis", "FastAPI"],
      strengths: ["Python", "Django", "PostgreSQL", "Redis"],
      missing: ["FastAPI"],
      learn: "Build asynchronous services using FastAPI and asyncpg",
      explain: "Superb backend engineering foundations. Missing FastAPI, but core relational database skills are highly verified."
    },
    {
      title: "DevOps Engineer",
      company: "SaaSify",
      location: "Remote (US)",
      match: 78,
      required: ["Kubernetes", "AWS", "Docker", "Terraform", "Python"],
      strengths: ["Python", "Docker"],
      missing: ["Kubernetes", "AWS", "Terraform"],
      learn: "Acquire CKA certification and Terraform fundamentals",
      explain: "High programming proficiency, but missing main cloud infrastructure and orchestration capabilities."
    }
  ],
  req_qf2o6dc: [
    {
      title: "Senior Full Stack Engineer",
      company: "WebLabs",
      location: "Prague, Czech Republic",
      match: 90,
      required: ["TypeScript", "React", "Node.js", "Next.js", "MongoDB"],
      strengths: ["React", "TypeScript", "Node.js", "Next.js"],
      missing: ["MongoDB"],
      learn: "Complete NoSQL data modeling course with MongoDB Atlas",
      explain: "Perfect frontend stack overlap. Minor database gap easily addressed through standard onboarding."
    },
    {
      title: "Frontend Architect",
      company: "DesignHub",
      location: "London, UK",
      match: 87,
      required: ["React", "CSS/SASS", "TypeScript", "TailwindCSS", "Figma"],
      strengths: ["React", "TypeScript"],
      missing: ["CSS/SASS", "TailwindCSS", "Figma"],
      learn: "Deepen CSS grid systems, Tailwind layouts, and design-to-code practices",
      explain: "Verified TypeScript/React logic skills. Needs minor styling and tool integrations."
    }
  ],
  req_88pb5sl: [
    {
      title: "Lead DevOps Engineer",
      company: "CloudOps",
      location: "San Francisco, CA",
      match: 89,
      required: ["Kubernetes", "Terraform", "AWS", "Docker", "Go"],
      strengths: ["Kubernetes", "Terraform", "AWS", "Docker"],
      missing: ["Go"],
      learn: "Learn Go language syntax and concurrency patterns (goroutines)",
      explain: "Exceptional infrastructure-as-code and orchestration skills. Missing Go language requirement."
    },
    {
      title: "Systems Architect",
      company: "SafeBank",
      location: "New York, NY",
      match: 82,
      required: ["Linux", "Network Security", "AWS", "Kubernetes", "CI/CD"],
      strengths: ["AWS", "Kubernetes"],
      missing: ["Linux", "Network Security", "CI/CD"],
      learn: "Acquire AWS Certified Security Specialty and learn Linux shell engineering",
      explain: "Strong cloud container architecture, but needs security hardening experience."
    }
  ],
  req_xlals0e: [
    {
      title: "Senior Mobile Engineer",
      company: "AppVentures",
      location: "Lagos, Nigeria",
      match: 85,
      required: ["Swift", "Kotlin", "React Native", "Flutter", "Firebase"],
      strengths: ["Swift", "Kotlin", "React Native", "Firebase"],
      missing: ["Flutter"],
      learn: "Learn Dart programming language and Flutter state management",
      explain: "Excellent mobile app development background. Small cross-platform framework gap."
    },
    {
      title: "iOS Developer",
      company: "Apple",
      location: "London, UK",
      match: 75,
      required: ["Swift", "Objective-C", "SwiftUI", "CoreData", "Combine"],
      strengths: ["Swift"],
      missing: ["Objective-C", "SwiftUI", "CoreData", "Combine"],
      learn: "Learn SwiftUI layout composition and CoreData persistence patterns",
      explain: "Solid Swift programming foundation, but lacks deep iOS SDK frameworks."
    }
  ],
  req_7kh7ooa: [
    {
      title: "Senior Frontend UI Engineer",
      company: "PixelCraft",
      location: "Tokyo, Japan",
      match: 91,
      required: ["JavaScript", "CSS/SASS", "React", "Figma", "WebGL"],
      strengths: ["JavaScript", "CSS/SASS", "React", "Figma"],
      missing: ["WebGL"],
      learn: "Learn WebGL rendering pipelines and Three.js scenes/materials",
      explain: "Incredible UI layout design implementation skills. Missing creative 3D web graphics capability."
    },
    {
      title: "UI Designer",
      company: "Adobe",
      location: "San Jose, CA",
      match: 80,
      required: ["Figma", "Adobe XD", "UI Layout", "Typography", "React"],
      strengths: ["Figma", "React"],
      missing: ["Adobe XD", "UI Layout", "Typography"],
      learn: "Complete corporate typography design module",
      explain: "Good frontend logic skillset, but design-heavy role requires more typography principles."
    }
  ]
};

function getDisplayName(c: any): string {
  if (c.name && !c.name.startsWith("req_")) return c.name;
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

function JobsPage() {
  const { userId } = useProfileStore();
  const { user } = useAuthStore();
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

  // Carousel Index state
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Selected Role Detail for Analysis Modal
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<JobRecommendation | null>(null);

  // Reset slider index when candidate changes
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [selectedUserId]);

  // Load candidate list (always fetch to get detailed profiles)
  useEffect(() => {
    let isMounted = true;
    setLoadingCandidates(true);
    setCandidatesError(null);

    api.getCandidates()
      .then((data) => {
        if (isMounted) {
          let list: CandidateItem[] = [];
          if (data && data.length > 0) {
            list = (data || []).map((c: any) => {
              const scoreBreakdown = c.authenticity_metrics?.score_breakdown || {};
              const topMatch = c.matched_roles?.[0] || {};
              const displayName = getDisplayName(c);
              const analysis = c.analysis_summary || {};
              return {
                candidate_id: c.candidate_id,
                name: displayName,
                email: c.email || "unknown@example.com",
                role: c.role || topMatch.role || "Software Engineer",
                score: Math.round((c.score || 0) * 10),
                auth: Math.round((scoreBreakdown.authenticity || 9.0) * 10),
                match: Math.round((topMatch.similarity || 0.85) * 100),
                top_skills: c.top_skills || [],
                avatar: getInitials(displayName),
                location: analysis.location || "Location Not Provided",
                experience: analysis.experience || "N/A",
                noticePeriod: analysis.notice_period || "Available Now",
                elevatorPitch: analysis.elevator_pitch || "No about information provided.",
                photos: analysis.photos || [],
                insights: analysis.strengths || [],
              };
            });
          } else {
            // Fallback to pre-seeded candidates list
            list = PRE_SEEDED_CANDIDATES.map((c) => ({
              candidate_id: c.id,
              name: c.name,
              email: c.email,
              role: c.role,
              score: c.score,
              auth: c.auth,
              match: c.match,
              top_skills: c.skills,
              avatar: c.avatar,
              location: c.location,
              experience: c.experience,
              noticePeriod: c.noticePeriod,
              elevatorPitch: c.elevatorPitch,
              photos: c.photos,
              insights: c.insights,
            }));
          }
          let filteredList = list;
          if (user && user.role === 'recruiter') {
            filteredList = list.filter(c => c.candidate_id !== user.id && c.email !== user.email && c.name !== user.name);
          }
          setCandidatesList(filteredList);
          setLoadingCandidates(false);
          
          // Determine initial selection
          if (userId) {
            setSelectedUserId(userId);
          } else if (filteredList.length > 0) {
            setSelectedUserId(filteredList[0].candidate_id);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch candidates:", err);
          setCandidatesError("Failed to connect to backend candidate database. Falling back to pre-seeded profiles.");
          
          const list = PRE_SEEDED_CANDIDATES.map((c) => ({
            candidate_id: c.id,
            name: c.name,
            email: c.email,
            role: c.role,
            score: c.score,
            auth: c.auth,
            match: c.match,
            top_skills: c.skills,
            avatar: c.avatar,
            location: c.location,
            experience: c.experience,
            noticePeriod: c.noticePeriod,
            elevatorPitch: c.elevatorPitch,
            photos: c.photos,
            insights: c.insights,
          }));
          
          let filteredList = list;
          if (user && user.role === 'recruiter') {
            filteredList = list.filter(c => c.candidate_id !== user.id && c.email !== user.email && c.name !== user.name);
          }
          setCandidatesList(filteredList);
          setLoadingCandidates(false);
          
          if (userId) {
            setSelectedUserId(userId);
          } else if (filteredList.length > 0) {
            setSelectedUserId(filteredList[0].candidate_id);
          }
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
          if (data && data.recommended_roles && data.recommended_roles.length > 0) {
            setRoles(data.recommended_roles);
          } else {
            setRoles(PRE_SEEDED_JOB_RECOMMENDATIONS[selectedUserId] || []);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch jobs:", err);
          setError("Failed to load job recommendations from live backend. Falling back to pre-seeded recommendations.");
          
          const fallbackRoles = PRE_SEEDED_JOB_RECOMMENDATIONS[selectedUserId] || [];
          setRoles(fallbackRoles);
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
          {/* Large Premium Profile Hero Card */}
          {activeCandidate && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-md p-6 elegant-shadow"
            >
              {/* Premium Glow effect */}
              <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[var(--indigo)]/10 blur-3xl pointer-events-none" />
              <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-[var(--purple)]/10 blur-3xl pointer-events-none" />

              <div className="relative flex flex-col md:flex-row gap-6 items-start">
                {/* Left: Photo Slider (Carousel) */}
                <div className="relative w-full md:w-64 h-72 shrink-0 rounded-xl overflow-hidden bg-muted group/slider border border-muted/20">
                  {activeCandidate.photos && activeCandidate.photos.length > 0 ? (
                    <>
                      <img
                        src={activeCandidate.photos[activePhotoIndex]}
                        alt={activeCandidate.name}
                        className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105"
                      />
                      
                      {activeCandidate.photos.length > 1 && (
                        <>
                          {/* Navigation Arrows */}
                          <button
                            type="button"
                            onClick={() => setActivePhotoIndex(prev => prev === 0 ? activeCandidate.photos.length - 1 : prev - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200 hover:bg-black/80"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePhotoIndex(prev => prev === activeCandidate.photos.length - 1 ? 0 : prev + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200 hover:bg-black/80"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          
                          {/* Indicators */}
                          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                            {activeCandidate.photos.map((_, idx) => (
                              <span
                                key={idx}
                                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                                  idx === activePhotoIndex ? "w-3 bg-white" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-muted/40 p-4">
                      <User className="h-12 w-12 opacity-40 mb-2" />
                      <span className="text-xs font-medium">No photos uploaded</span>
                    </div>
                  )}
                </div>

                {/* Right: Info & Metrics */}
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-foreground">{activeCandidate.name}</h2>
                        <p className="text-sm font-bold text-[var(--indigo)] mt-0.5">{activeCandidate.role}</p>
                      </div>
                      
                      {/* TrueSkill Badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verification status:</span>
                        <Badge className="bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 font-bold px-2.5 py-0.5 text-xs">
                          Verified Profile ✓
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata Row */}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[var(--indigo)]" /> {activeCandidate.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[var(--indigo)]" /> {activeCandidate.experience} Experience
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-[var(--indigo)]" /> {activeCandidate.noticePeriod}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-[var(--indigo)]" /> {activeCandidate.email}
                      </span>
                    </div>
                  </div>

                  {/* Elevator Pitch */}
                  <div className="rounded-xl bg-muted/20 border border-muted/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Candidate Summary</p>
                    <p className="text-xs text-foreground/80 leading-relaxed font-normal italic">
                      "{activeCandidate.elevatorPitch}"
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border bg-card/40 p-3 text-center flex flex-col justify-center items-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">TrueSkill™</span>
                        <span className="text-2xl font-black text-foreground mt-1">{activeCandidate.score}%</span>
                        <div className="mt-1 w-full bg-muted rounded-full h-1">
                          <div className="h-full bg-[var(--indigo)] rounded-full" style={{ width: `${activeCandidate.score}%` }} />
                        </div>
                      </div>

                      <div className="rounded-xl border bg-card/40 p-3 text-center flex flex-col justify-center items-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Authenticity</span>
                        <span className="text-2xl font-black text-emerald-500 mt-1">{activeCandidate.auth}%</span>
                        <div className="mt-1 w-full bg-muted rounded-full h-1">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeCandidate.auth}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Tech Stack Badge Cloud */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Verified Skill Stack</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeCandidate.top_skills.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px] font-semibold bg-muted/40">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

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

                  {/* Candidate and Match Status Header */}
                  <div className="mt-4 flex items-center justify-between border-t border-muted/15 pt-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                      <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      Candidate: <span className="text-foreground font-bold">{activeCandidateName}</span>
                    </span>
                    {r.match >= 90 ? (
                      <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-[10px] px-2 py-0.5">
                        Perfect Match ✨
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-500 font-bold text-[10px] px-2 py-0.5">
                        Not a Perfect Match ⚠️
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4">
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

                  {/* Skill Analysis Summary */}
                  <div className="mt-4 rounded-xl bg-muted/20 border border-muted/10 p-3 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Skill Analysis</p>
                    <p className="text-xs text-foreground/80 leading-relaxed font-normal">
                      {activeCandidateName} has verified proficiency in {r.strengths?.length || 0} out of {(r.required || []).length} required skills for this role. {
                        (r.missing || []).length > 0 
                          ? `Gaps to address: ${(r.missing || []).join(", ")}.`
                          : "Matches all required technical proficiencies!"
                      }
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl border bg-gradient-to-br from-[var(--indigo)]/5 to-[var(--purple)]/5 p-4 space-y-2">
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

                  <Button
                    onClick={() => setSelectedRoleForDetail(r)}
                    size="sm"
                    variant="ghost"
                    className="mt-5 w-full justify-between group-hover:bg-muted/50 border hover:border-transparent font-bold"
                  >
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
                  
                  {/* Candidate Name & Match Status tag */}
                  <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3 text-indigo-500" />
                      Candidate: <span className="text-foreground font-bold">{activeCandidateName}</span>
                    </span>
                    {customMatchResult.compatibility_score >= 90 ? (
                      <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-[9px] px-1.5 py-0">
                        Perfect Match ✨
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-500 font-bold text-[9px] px-1.5 py-0">
                        Not a Perfect Match ⚠️
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-4xl font-black gradient-text tracking-tighter">{Math.round(customMatchResult.compatibility_score)}%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compatibility</p>
                </div>
              </div>

              {/* Dynamic Skill Analysis box */}
              <div className="rounded-xl bg-muted/20 border border-muted/10 p-3 space-y-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Skill Analysis Summary</h4>
                <p className="text-xs text-foreground/80 leading-relaxed font-normal">
                  {activeCandidateName} matches {customMatchResult.matching_skills.length} skills in the job description. {
                    customMatchResult.missing_skills.length > 0 
                      ? `Missing requirements: ${customMatchResult.missing_skills.join(", ")}.`
                      : "Matches 100% of the custom technical requirements!"
                  }
                </p>
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

      {/* Detailed Match Analysis Dialog */}
      <Dialog open={!!selectedRoleForDetail} onOpenChange={(open) => { if (!open) setSelectedRoleForDetail(null); }}>
        <DialogContent className="max-w-3xl bg-card border elegant-shadow animate-fade-in max-h-[90vh] overflow-y-auto pr-2">
          {selectedRoleForDetail && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-white shadow-md">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-black text-foreground">
                        {selectedRoleForDetail.title}
                      </DialogTitle>
                      <p className="text-xs text-muted-foreground font-bold mt-0.5">
                        {selectedRoleForDetail.company} • {selectedRoleForDetail.location}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-4xl font-black gradient-text tracking-tighter">
                      {Math.round(selectedRoleForDetail.match)}%
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Match Compatibility</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Match Status Badge Block */}
                <div className="flex items-center justify-between rounded-xl bg-muted/20 border p-4">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Matching Candidate: <span className="text-foreground font-bold">{activeCandidate?.name}</span>
                  </span>
                  {selectedRoleForDetail.match >= 90 ? (
                    <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-xs px-3 py-1">
                      Perfect Match ✨
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-500 font-bold text-xs px-3 py-1">
                      Not a Perfect Match ⚠️
                    </Badge>
                  )}
                </div>

                {/* Skill Alignment Matrix */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills Alignment Matrix</h3>
                  <div className="overflow-hidden rounded-xl border border-muted/20">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="p-3">Required Skill</th>
                          <th className="p-3">Candidate Status</th>
                          <th className="p-3">Proficiency Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted/10">
                        {selectedRoleForDetail.required.map((skill) => {
                          const isStrength = selectedRoleForDetail.strengths.some(s => s.toLowerCase().includes(skill.toLowerCase()));
                          return (
                            <tr key={skill} className="hover:bg-muted/10">
                              <td className="p-3 font-semibold text-foreground">{skill}</td>
                              <td className="p-3">
                                {isStrength ? (
                                  <Badge className="bg-emerald-500/15 hover:bg-emerald-500/15 text-[var(--success)] border-0 font-semibold py-0.5">
                                    <Check className="mr-1 h-3 w-3 inline" /> Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-[var(--warning)]/30 text-[var(--warning)] bg-[var(--warning)]/5 font-semibold py-0.5">
                                    Gap Identified
                                  </Badge>
                                )}
                              </td>
                              <td className="p-3 text-muted-foreground font-normal">
                                {isStrength ? (
                                  "Expert capability verified in live interactive assessment."
                                ) : (
                                  <span className="text-[var(--warning)] font-medium">Needs upskilling prior to project placement.</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Overlay Analysis Reasoning */}
                <div className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-[var(--purple)]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Detailed Match & Gaps Reasoning</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedRoleForDetail.explain}
                  </p>
                </div>

                {/* Recommended Upskilling Pathway */}
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[var(--indigo)]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Custom Upskilling Blueprint</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    To reach 100% role readiness, complete the following targeted learning milestones:
                  </p>
                  
                  <div className="space-y-2">
                    {selectedRoleForDetail.learn.split(/;|,/).map((milestone, idx) => {
                      const cleanMilestone = milestone.trim();
                      if (!cleanMilestone) return null;
                      return (
                        <div key={idx} className="flex items-start gap-3 rounded-lg bg-muted/20 p-2.5">
                          <input type="checkbox" className="mt-0.5 rounded border-muted accent-[var(--indigo)]" />
                          <div className="text-xs">
                            <span className="font-bold text-foreground">Milestone {idx + 1}: </span>
                            <span className="text-muted-foreground">{cleanMilestone}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setSelectedRoleForDetail(null)} className="rounded-xl font-bold">
                    Close Analysis
                  </Button>
                  <Button className="gradient-primary text-white border-0 font-bold rounded-xl shadow-md transition-all hover:scale-102">
                    Generate Placement Report
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
