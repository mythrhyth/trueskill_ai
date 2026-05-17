import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Brain, ShieldCheck, Network, Sparkles, Target, BarChart3,
  Github, FileCheck2, Workflow, ScanSearch, Trophy, ArrowRight,
  Check, X, Star, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrueSkill AI — Beyond Resumes. Discover Real Skills." },
      { name: "description", content: "AI-powered talent intelligence platform. Verified skills from GitHub, coding profiles, certifications, and projects." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Brain, title: "AI Skill Extraction", desc: "Parses GitHub repos, READMEs, commits, and code to identify true competency." },
  { icon: ShieldCheck, title: "Multi-source Verification", desc: "Cross-references certifications, contributions, and platform signals." },
  { icon: Network, title: "Graph Skill Intelligence", desc: "Maps relationships between skills, frameworks, and domains." },
  { icon: Sparkles, title: "Explainable AI Scoring", desc: "Every score comes with transparent, auditable reasoning." },
  { icon: Target, title: "Smart Talent Matching", desc: "Match candidates to roles based on verified depth, not keywords." },
  { icon: BarChart3, title: "Recruiter Analytics", desc: "Pipeline insights, comparison, and downloadable reports." },
];

const workflow = [
  { icon: Github, title: "Upload Profiles", desc: "GitHub, LinkedIn, LeetCode, certifications." },
  { icon: ScanSearch, title: "AI Skill Extraction", desc: "Identify languages, frameworks, depth." },
  { icon: FileCheck2, title: "Validation Engine", desc: "Verify authenticity across sources." },
  { icon: ShieldCheck, title: "Authenticity Scoring", desc: "Detect inflated claims and ghost repos." },
  { icon: Network, title: "Skill Graph", desc: "Construct relationships and clusters." },
  { icon: Target, title: "Job Matching", desc: "Role recommendations with gap analysis." },
  { icon: Sparkles, title: "AI Explanations", desc: "Transparent reasoning for every score." },
];

function Nav() {
  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl border bg-background/60 px-4 py-2.5 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold">TrueSkill AI</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#334155] md:flex">
          <a href="#features" className="hover:text-[#1E1B4B] transition-colors">Features</a>
          <a href="#workflow" className="hover:text-[#1E1B4B] transition-colors">Workflow</a>
          <a href="#why" className="hover:text-[#1E1B4B] transition-colors">Why us</a>
          <a href="#testimonials" className="hover:text-[#1E1B4B] transition-colors">Customers</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex text-[#334155] hover:text-[#1E1B4B] font-bold transition-colors hover:bg-black/5">
            <Link to="/login">Log in</Link>
          </Button>
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#9333EA] opacity-40 blur group-hover:opacity-70 transition duration-500" />
            <Button asChild size="sm" className="relative flex items-center overflow-hidden rounded-full border-0 text-white shadow-xl transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]" style={{ background: 'linear-gradient(135deg, #4F46E5, #9333EA)' }}>
              <Link to="/signup">
                <span className="relative z-10 flex items-center gap-1.5 font-bold">
                  Sign up <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute inset-0 gradient-mesh opacity-70" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[var(--purple)]/20 blur-[120px]" />

        {/* floating glowing spheres */}
        <motion.div
          className="absolute -top-20 left-[10%] h-64 w-64 rounded-full bg-[var(--indigo)]/20 blur-[80px]"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[20%] right-[10%] h-72 w-72 rounded-full bg-[var(--cyan)]/20 blur-[90px]"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* floating particles (AI network nodes) */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{
              width: Math.random() * 4 + 1 + "px",
              height: Math.random() * 4 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, -Math.random() * 100 - 50],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse-glow" />
            New · LinkedIn CoachIn Hackathon Edition
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-5xl font-bold tracking-tight text-[#1E1B4B] md:text-7xl"
          >
            Beyond Resumes.<br />
            <span className="gradient-text">Discover Real Skills.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-[#5B6475] font-medium"
          >
            TrueSkill AI analyzes GitHub activity, coding profiles, certifications, and project intelligence
            to build verified AI-powered skill credibility scores.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="relative overflow-hidden gradient-primary border-0 text-white shadow-lg transition-transform hover:scale-105">
              <Link to="/signup">
                <span className="relative z-10 flex items-center">Analyze My Profile <ArrowRight className="ml-2 h-4 w-4" /></span>
                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition-colors">
              <Link to="/login">Recruit Talent</Link>
            </Button>
          </motion.div>

          {/* Holographic Cards Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-20 max-w-5xl"
          >
            <div className="relative">
              {/* Background glow for the cards */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--indigo)]/20 via-[var(--cyan)]/20 to-[var(--purple)]/20 blur-3xl rounded-[3rem]" />
              
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Evidence-Backed Skill Verification", icon: ShieldCheck, color: "var(--success)" },
                  { title: "AI-Powered Hiring Intelligence", icon: Brain, color: "var(--indigo)" },
                  { title: "Cross-Platform Authenticity Analysis", icon: Network, color: "var(--cyan)" },
                  { title: "Explainable Recruiter Insights", icon: Sparkles, color: "var(--purple)" },
                ].map((card, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-1 backdrop-blur-2xl transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_50px_rgba(var(--indigo-rgb),0.15)] hover:border-white/60"
                  >
                    {/* Animated gradient border effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--indigo)]/10 via-[var(--cyan)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative flex h-full items-center gap-4 rounded-xl bg-gradient-to-br from-white/50 to-transparent p-5 border border-white/20">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/80 border border-white/40 shadow-sm group-hover:bg-white transition-colors">
                        <card.icon className="h-6 w-6" style={{ color: card.color }} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-[#24304A] tracking-tight">{card.title}</h3>
                        <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-black/5 shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 1.5, delay: idx * 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: card.color }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold text-[var(--indigo)] uppercase tracking-widest">Capabilities</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1E1B4B] md:text-4xl">
              An end-to-end intelligence layer for hiring
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border bg-card p-6 transition hover:border-[var(--indigo)]/50 hover:elegant-shadow"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--indigo)]/15 to-[var(--purple)]/15">
                  <f.icon className="h-5 w-5 text-[var(--indigo)]" />
                </div>
                <h3 className="font-bold text-[#24304A]">{f.title}</h3>
                <p className="mt-1 text-sm text-[#5B6475] font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="border-t bg-muted/20 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-[var(--purple)]">Workflow</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              From raw profile to verified intelligence
            </h2>
          </div>
          <div className="relative mt-14">
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-[var(--indigo)]/40 via-[var(--purple)]/40 to-[var(--cyan)]/40 md:block" />
            <div className="space-y-6">
              {workflow.map((w, i) => (
                <motion.div
                  key={w.title}
                  initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative grid gap-4 md:grid-cols-2 md:gap-12 ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}
                >
                  <div className={`flex ${i % 2 ? "md:justify-start" : "md:justify-end"}`}>
                    <div className="max-w-sm rounded-2xl border bg-card p-5 elegant-shadow">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-white">
                          <w.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Step {i + 1}</span>
                      </div>
                      <h3 className="font-semibold">{w.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{w.desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:block" />
                  <div className="absolute left-1/2 top-6 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--indigo)] ring-4 ring-background md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="why" className="border-t py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-[var(--cyan)]">Comparison</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Why TrueSkill AI</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="text-lg font-semibold text-muted-foreground">Traditional Resume</h3>
              <ul className="mt-5 space-y-3 text-sm">
                {["Self-reported skills", "Keyword stuffing", "Static document", "No verification", "Buzzword inflation", "Manual screening"].map(t => (
                  <li key={t} className="flex items-center gap-2 text-muted-foreground"><X className="h-4 w-4 text-destructive" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[var(--indigo)]/10 via-card to-[var(--purple)]/10 p-6 elegant-shadow">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[var(--purple)]/20 blur-3xl" />
              <h3 className="text-lg font-semibold gradient-text">TrueSkill AI</h3>
              <ul className="mt-5 space-y-3 text-sm">
                {["Verified from real activity", "Behavioral & code signals", "Live, continuous scoring", "Multi-source authenticity", "Explainable AI reasoning", "Instant intelligent matching"].map(t => (
                  <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--success)]" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="border-t bg-muted/20 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-[var(--indigo)]">Loved by teams</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Trusted by recruiters & engineers</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { q: "We replaced our entire resume-screening pipeline. Time-to-shortlist dropped 78%.", n: "Ananya R.", r: "Head of Talent, Northwind" },
              { q: "Finally, a tool that sees through buzzwords and finds engineers who actually ship.", n: "Marcus L.", r: "Eng. Manager, Loop" },
              { q: "The explainability is the killer feature. Every hiring decision is defensible.", n: "Priya S.", r: "Director of Engineering" },
            ].map((t) => (
              <div key={t.n} className="rounded-2xl border bg-card p-6 elegant-shadow">
                <div className="mb-3 flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[var(--warning)] text-[var(--warning)]" />)}</div>
                <p className="text-sm">"{t.q}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full gradient-primary text-xs text-white flex items-center justify-center font-semibold">{t.n[0]}</div>
                  <div>
                    <p className="text-sm font-medium">{t.n}</p>
                    <p className="text-xs text-muted-foreground">{t.r}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl border gradient-primary p-12 text-center text-white elegant-shadow">
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <Trophy className="relative mx-auto h-10 w-10" />
            <h2 className="relative mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Hire engineers who actually ship</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/80">
              Replace guesswork with verified, explainable intelligence.
            </p>
            <div className="relative mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="hover:scale-105 transition-transform"><Link to="/signup">Get Started</Link></Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 transition-colors"><Link to="/login">Sign In</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary"><Brain className="h-3.5 w-3.5 text-white" /></div>
              <span className="text-sm font-semibold">TrueSkill AI</span>
              <span className="text-xs text-muted-foreground">© 2026</span>
            </div>
            <div className="flex gap-5 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground">Product</a>
              <a href="#" className="hover:text-foreground">Pricing</a>
              <a href="#" className="hover:text-foreground">Docs</a>
              <a href="#" className="hover:text-foreground">Privacy</a>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Zap className="h-3 w-3 text-[var(--warning)]" />LinkedIn CoachIn Hackathon</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
